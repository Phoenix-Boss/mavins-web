// src/lib/utils/clickBatcher.ts
import { createClient } from '@/lib/supabase/client';

interface ClickBatch {
  [shareId: string]: number;
}

class ClickBatcher {
  private batch: ClickBatch = {};
  private flushInterval: NodeJS.Timeout | null = null;
  private readonly BATCH_SIZE = 100; // Flush when this many total clicks accumulated
  private readonly FLUSH_INTERVAL_MS = 5000; // Flush every 5 seconds
  private isFlushing = false;

  constructor() {
    this.startAutoFlush();
  }

  // Add a click to the batch
  public addClick(shareId: string): void {
    if (!this.batch[shareId]) {
      this.batch[shareId] = 0;
    }
    this.batch[shareId] += 1;

    // Check if we've reached the batch size threshold
    const totalClicks = this.getTotalClicks();
    if (totalClicks >= this.BATCH_SIZE) {
      this.flush();
    }
  }

  // Get total clicks in the batch
  private getTotalClicks(): number {
    return Object.values(this.batch).reduce((sum: number, count: number) => sum + count, 0);
  }

  // Flush the batch to database
  public async flush(): Promise<void> {
    // Prevent concurrent flushes
    if (this.isFlushing) {
      return;
    }

    const batchToFlush = { ...this.batch };
    const hasClicks = this.getTotalClicks() > 0;

    if (!hasClicks) {
      return;
    }

    this.isFlushing = true;
    this.batch = {}; // Reset immediately to accept new clicks while flushing

    try {
      await this.persistBatch(batchToFlush);
      console.log(`[ClickBatcher] Flushed ${this.getTotalClicksFromBatch(batchToFlush)} clicks for ${Object.keys(batchToFlush).length} shares`);
    } catch (error) {
      console.error('[ClickBatcher] Failed to flush batch:', error);
      // On error, add clicks back to batch (with backoff to prevent infinite loop)
      this.mergeBatch(batchToFlush);
    } finally {
      this.isFlushing = false;
    }
  }

  // Persist batch to database using bulk update
  private async persistBatch(batch: ClickBatch): Promise<void> {
    const supabase = createClient();
    
    // Build bulk update queries using CASE statements
    const shareIds = Object.keys(batch);
    if (shareIds.length === 0) return;

    // Option 1: Use multiple updates in a transaction
    const updates = shareIds.map(async (shareId) => {
      const count = batch[shareId];
      const { error } = await supabase
        .from('shares')
        .update({ 
          clicks: supabase.rpc('increment_batch', { 
            row_id: shareId, 
            increment_by: count 
          })
        })
        .eq('share_id', shareId);

      if (error) {
        console.error(`[ClickBatcher] Failed to update share ${shareId}:`, error);
        throw error;
      }
    });

    await Promise.all(updates);
  }

  // Helper to get total clicks from a batch
  private getTotalClicksFromBatch(batch: ClickBatch): number {
    return Object.values(batch).reduce((sum: number, count: number) => sum + count, 0);
  }

  // Merge a batch back into the current batch (on error recovery)
  private mergeBatch(batch: ClickBatch): void {
    for (const [shareId, count] of Object.entries(batch)) {
      if (!this.batch[shareId]) {
        this.batch[shareId] = 0;
      }
      this.batch[shareId] += count;
    }
  }

  // Start the auto-flush interval
  private startAutoFlush(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flushInterval = setInterval(() => {
      this.flush();
    }, this.FLUSH_INTERVAL_MS);
  }

  // Stop the auto-flush (for graceful shutdown)
  public stop(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    // Final flush on shutdown
    this.flush();
  }
}

// Singleton instance
let clickBatcherInstance: ClickBatcher | null = null;

export function getClickBatcher(): ClickBatcher {
  if (!clickBatcherInstance) {
    clickBatcherInstance = new ClickBatcher();
  }
  return clickBatcherInstance;
}

// For graceful shutdown
process.on('beforeExit', () => {
  if (clickBatcherInstance) {
    clickBatcherInstance.stop();
  }
});

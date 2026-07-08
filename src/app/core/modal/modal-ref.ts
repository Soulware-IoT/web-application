/**
 * Handle returned by `ModalService.open`. The caller uses it to read the data
 * passed in, close the modal with a result, and await that result — without
 * knowing anything about how the modal is rendered.
 */
export class ModalRef<R = unknown, D = unknown> {
  /** Awaits the modal's result; resolves with `undefined` when dismissed. */
  readonly closed: Promise<R | undefined>;

  private resolve!: (result: R | undefined) => void;
  private settled = false;

  constructor(readonly data: D | undefined) {
    this.closed = new Promise<R | undefined>((res) => (this.resolve = res));
  }

  close(result?: R): void {
    if (this.settled) return;
    this.settled = true;
    this.resolve(result);
  }
}

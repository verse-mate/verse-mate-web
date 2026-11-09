import { HTMLRewriter as WasmRewriter, type ElementHandlers } from 'html-rewriter-wasm';

export class TestHTMLRewriter {
  private handlers: [string, ElementHandlers][] = [];

  on(selector: string, handlers: ElementHandlers) {
    this.handlers.push([selector, handlers]);
    return this;
  }

  transform(response: Response): Response {
    const handlers = this.handlers;
    const body = new ReadableStream<Uint8Array>({
      async start(controller) {
        const rewriter = new WasmRewriter((chunk) => controller.enqueue(chunk.slice()));
        for (const [selector, handler] of handlers) rewriter.on(selector, handler);
        await rewriter.write(new Uint8Array(await response.arrayBuffer()));
        await rewriter.end();
        rewriter.free();
        controller.close();
      },
    });
    const headers = new Headers(response.headers);
    headers.delete('content-length');
    return new Response(body, { status: response.status, statusText: response.statusText, headers });
  }
}

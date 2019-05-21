declare module 'pan-zoom' {
    // no idea how to export this too
    interface zoomEvent {
        target: HTMLElement
        type: 'mouse' | 'touch'
        dx: number
        dy: number
        dz: number
        x: number
        y: number
        x0: number
        y0: number
    }

    function panZoom(target: HTMLElement | string): () => void
    function panZoom(target: HTMLElement | string, callback: (event: zoomEvent) => any): () => void
    function panZoom(callback: (event: zoomEvent) => any): () => void

    export = panZoom
}

declare module 'pan-zoom-interface' {
    export default interface zoomEvent {
        target: HTMLElement
        type: 'mouse' | 'touch'
        dx: number
        dy: number
        dz: number
        x: number
        y: number
        x0: number
        y0: number
    }
}

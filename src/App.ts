/// <reference path='../typings/assets.d.ts'/>
/// <reference path='../typings/panzoom.d.ts'/>

import {
    Scene,
    WebGLRenderer,
    OrthographicCamera,
    ShaderMaterial,
    ShaderMaterialParameters,
    PlaneBufferGeometry,
    Mesh,
    Vector2
} from 'three'
import panZoom from 'pan-zoom'

import zoomEvent from 'pan-zoom-interface'
import { IUniforms, IVec2Uniform, IFloatUniform } from 'three-uniforms'

import vertex from './shaders/mandelbrotVertex.glsl'
import fragment from './shaders/mandelbrotFragment.glsl'

interface MandelbrotUniforms extends IUniforms {
    translation: IVec2Uniform
    scale: IFloatUniform
    aspectRatio: IFloatUniform
    time: IFloatUniform
}

export default class App {
    private static readonly uniformPropertyKey = 'mandelbrot-uniforms'

    private scene: Scene
    private renderer: WebGLRenderer
    private camera: OrthographicCamera
    uniforms: MandelbrotUniforms

    constructor(private root: HTMLElement) {
        this.scene = new Scene()
        this.renderer = new WebGLRenderer()
        this.renderer.setPixelRatio(window.devicePixelRatio)

        this.camera = new OrthographicCamera(
            -window.innerWidth / 2,
            window.innerWidth / 2,
            -window.innerHeight / 2,
            window.innerHeight / 2,
            0.1,
            10
        )

        this.camera.position.z = 1

        const uniforms = /* localStorage.getItem(App.uniformPropertyKey) */ null

        this.uniforms = uniforms
            ? JSON.parse(uniforms)
            : {
                  translation: {
                      type: 'v2',
                      value: new Vector2(0, 0)
                  },
                  scale: { type: 'f', value: 0.6 },
                  aspectRatio: { type: 'f', value: window.innerWidth / window.innerHeight },
                  time: { type: 'f', value: 0.1 }
              }

        this.uniforms.aspectRatio.value = window.innerWidth / window.innerHeight

        if (!(this.uniforms.translation.value instanceof Vector2)) {
            const { x, y } = this.uniforms.translation.value

            this.uniforms.translation.value = new Vector2(x, y)
        }

        this.onResize = this.onResize.bind(this)
        this.onZoom = this.onZoom.bind(this)
    }

    async initalize() {
        const shaders = await this.fetchShaderSources()

        const material = new ShaderMaterial({
            uniforms: this.uniforms,
            defines: {
                ITERATION_LIMIT: 2000
            },
            ...shaders
        })

        const geometry = new PlaneBufferGeometry(2, 2)

        const mesh = new Mesh(geometry, material)
        this.scene.add(mesh)

        this.root.appendChild(this.renderer.domElement)

        this.onResize()
        window.addEventListener('resize', this.onResize)
        this.renderer.domElement.addEventListener(
            'mousedown',
            () => (this.renderer.domElement.style.cursor = 'grabbing')
        )
        this.renderer.domElement.addEventListener(
            'mouseup',
            () => (this.renderer.domElement.style.cursor = 'grab')
        )

        setInterval(() => {
            localStorage.setItem(App.uniformPropertyKey, JSON.stringify(this.uniforms))
        }, 1000)

        panZoom(this.renderer.domElement, this.onZoom)
    }

    private onResize() {
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        this.uniforms.aspectRatio.value = window.innerWidth / window.innerHeight
    }

    private onZoom(event: zoomEvent) {
        const step = Math.min(0.001, 0.1 / this.uniforms.scale.value)

        this.uniforms.scale.value -=
            Math.sign(event.dz) * Math.pow(1.6, Math.abs(event.dz * 0.05)) * 0.001
        this.uniforms.translation.value.x -= Math.sign(event.dx) * step
        this.uniforms.translation.value.y += event.dy * step

        //console.log(event)
        console.log(event.dz, this.uniforms.scale.value)
    }

    private async fetchShaderSources(): Promise<Partial<ShaderMaterialParameters>> {
        const responses = await Promise.all([fetch(vertex), fetch(fragment)])

        const [vertexShader, fragmentShader] = await Promise.all(responses.map(res => res.text()))

        return { vertexShader, fragmentShader }
    }

    animate() {
        this.renderer.render(this.scene, this.camera)

        this.uniforms.time.value += 0.01

        window.requestAnimationFrame(this.animate.bind(this))
    }
}

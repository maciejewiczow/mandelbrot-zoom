/// <reference path='../typings/assets.d.ts'/>

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
    private scene: Scene
    private renderer: WebGLRenderer
    private camera: OrthographicCamera
    uniforms: MandelbrotUniforms

    private isPlaying: boolean

    constructor(private root: HTMLElement) {
        this.scene = new Scene()
        this.renderer = new WebGLRenderer()
        this.renderer.setPixelRatio(window.devicePixelRatio)

        this.isPlaying = true

        this.camera = new OrthographicCamera(
            -window.innerWidth / 2,
            window.innerWidth / 2,
            -window.innerHeight / 2,
            window.innerHeight / 2,
            0.1,
            10
        )

        this.camera.position.z = 1

        this.uniforms = {
            translation: {
                type: 'v2',
                value: new Vector2(-0.46857999999999983, 0.49127100000000007)
            },
            scale: { type: 'f', value: 1 },
            aspectRatio: { type: 'f', value: window.innerWidth / window.innerHeight },
            time: { type: 'f', value: 0.1 }
        }

        this.onResize = this.onResize.bind(this)
        this.onMouseMove = this.onMouseMove.bind(this)
        this.onMouseScroll = this.onMouseScroll.bind(this)
        this.onKeyPress = this.onKeyPress.bind(this)
    }

    private onResize() {
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        this.uniforms.aspectRatio.value = window.innerWidth / window.innerHeight
    }

    private onMouseMove() {}

    private onMouseScroll() {}

    private onKeyPress(e: KeyboardEvent) {
        const step = Math.min(0.1, 0.1 / this.uniforms.scale.value)

        switch (e.code) {
            case 'Space':
                if (this.isPlaying) this.pause()
                else this.play()
                break
            case 'ArrowUp':
                this.uniforms.translation.value.y += step
                break
            case 'ArrowDown':
                this.uniforms.translation.value.y -= step
                break
            case 'ArrowLeft':
                this.uniforms.translation.value.x -= step
                break
            case 'ArrowRight':
                this.uniforms.translation.value.x += step
                break
        }
    }

    private async fetchShaderSources(): Promise<Partial<ShaderMaterialParameters>> {
        const responses = await Promise.all([fetch(vertex), fetch(fragment)])

        const [vertexShader, fragmentShader] = await Promise.all(responses.map(res => res.text()))

        return { vertexShader, fragmentShader }
    }

    async initalize() {
        const shaders = await this.fetchShaderSources()

        const material = new ShaderMaterial({
            uniforms: this.uniforms,
            defines: {
                ITERATION_LIMIT: 440
            },
            ...shaders
        })

        const geometry = new PlaneBufferGeometry(2, 2)

        const mesh = new Mesh(geometry, material)
        this.scene.add(mesh)

        this.root.appendChild(this.renderer.domElement)

        this.onResize()
        window.addEventListener('resize', this.onResize)
        window.addEventListener('mousemove', this.onMouseMove)
        window.addEventListener('mousewheel', this.onMouseScroll)
        window.addEventListener('keydown', this.onKeyPress)
    }

    play() {
        this.isPlaying = true
        this.animate()
    }

    pause() {
        this.isPlaying = false
    }

    animate() {
        this.renderer.render(this.scene, this.camera)

        // @ts-ignore
        this.uniforms.time.value += 0.01
        this.uniforms.scale.value = Math.pow(this.uniforms.time.value, 2)

        if (this.uniforms.scale.value > 900000) this.uniforms.time.value = 0.1

        if (this.isPlaying) window.requestAnimationFrame(this.animate.bind(this))
    }
}

declare module '*.glsl' {
    const link: string
    export default link
}

declare module 'three-uniforms' {
    import { Vector2, Vector3, Vector4 } from 'three'

    type UniformType = 'f' | 'i' | 'v2' | 'v3' | 'v4'
    type UniformValue = number | Vector2 | Vector3 | Vector4

    export interface IUniform {
        type: UniformType
        value: UniformValue
    }

    export interface IIntUniform extends IUniform {
        type: 'i'
        value: number
    }

    export interface IFloatUniform extends IUniform {
        type: 'f'
        value: number
    }

    export interface IVec2Uniform extends IUniform {
        type: 'v2'
        value: Vector2
    }

    export interface IVec3Uniform extends IUniform {
        type: 'v3'
        value: Vector3
    }

    export interface IVec4Uniform extends IUniform {
        type: 'v4'
        value: Vector4
    }

    export interface IUniforms {
        [key: string]: IUniform
    }
}

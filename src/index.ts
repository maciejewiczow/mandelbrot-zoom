import './style.css'
import App from './App'
;(async () => {
    const root = document.getElementById('root')

    if (root == null) throw new Error('App root element not found')

    const app = new App(root)

    await app.initalize()
    // @ts-ignore
    window.app = app
    app.animate()
})()

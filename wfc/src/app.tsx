/*
 * @Description  : 
 * @Author       : 赵耀圣
 * @QQ           : 549184003
 * @Date         : 2021-03-31 09:20:28
 * @LastEditTime : 2021-10-11 14:02:28
 * @FilePath     : \showroom_editor\src\editor.tsx
 */

import ReactDOM from "react-dom";
import 'antd/dist/antd.css'
import { Workbench } from "./workbench";





export class App {
    wb: Workbench;

    constructor() {

        this.preInit();
        this.handleEvent();

        this.postInit();
    }

    postInit() {

    }

    handleEvent() {
        window.addEventListener("resize", (ev: UIEvent) => {
            this.onResize();
        })


    }


    onResize() {

    }

    preInit() {
        this.wb = new Workbench(this, document.getElementById('root'));
    }
}


declare global {
    interface Window {
        app: App
    }
}

export function domContentLoaded(): Promise<any> {
    return new Promise<any>(resolve => {
        const readyState = document.readyState;
        if (readyState === 'complete' /* || (document && document.body !== null) */) {
            setTimeout(resolve);
        } else {
            window.addEventListener('DOMContentLoaded', resolve, false);
        }
    });
}



domContentLoaded().then(() => {
    const editor = new App();
    window.app = editor;
})

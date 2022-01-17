/**
 * 控制调用间隔 但是漏数据,没有开始执行的就清除掉
 * @param {*} callback 
 * @param {*} delay 
 */
export function debounce(callback: Function, delay: number) {

    var t: any = undefined;

    return (...args: any) => {
        if (t) {
            clearTimeout(t);
        }

        t = setTimeout(() => {
            callback(...args);
        }, delay || 300);
    }
}


/**
 * 控制调用次数 但是不漏数据，还有没执行完的就等待
 * @param {*} callback 
 * @param {*} delay 
 */
export function throttle(callback: Function, delay: number) {

    var t: any = undefined;

    return (...args: any) => {
        if (!t) {
            t = setTimeout(() => {
                callback(...args);
                t = null;
            }, delay || 300);
        }

    }
}
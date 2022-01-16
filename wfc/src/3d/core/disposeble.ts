const TRACK_DISPOSABLES = false;
const __is_disposable_tracked__ = '__is_disposable_tracked__';

function markTracked(x: any) {
    if (!TRACK_DISPOSABLES)
        return;

    if (x) {
        x[__is_disposable_tracked__] = true;
    }
}

function trackDisposable<T extends IDisposable>(x: T): T {
    if (!TRACK_DISPOSABLES) {
        return x;
    }

    const stack = new Error('Potentially leaked disposable').stack!;
    setTimeout(() => {
        if (!(x as any)[__is_disposable_tracked__]) {
            console.log(stack);
        }
    }, 3000);
    return x;
}


export interface IDisposable {
    dispose(): void;
}

export function isDisposable<E extends object>(thing: E): thing is E & IDisposable {
    return typeof (<IDisposable>thing).dispose === 'function' && (<IDisposable>thing).dispose.length === 0;
}

export function toDisposable(dispose: () => void): IDisposable {
    return { dispose };
}


export class DisposableStore {
    isDisposable: boolean;
    _toDispose: Set<unknown>;
    _isDisposed: boolean;

    constructor() {
        this.isDisposable = true;
        this._toDispose = new Set();
        this._isDisposed = false;
    }


    dispose() {
        if (this._isDisposed) {
            return;
        }

        markTracked(this);
        this._isDisposed = true;
        this.clear();
    }

    clear() {
        this._toDispose.forEach((item: any) => item.dispose());
        this._toDispose.clear();
    }

    add(t: any) {
        if (!t)
            return t;

        if (t === this)
            throw new Error('Cannot register a disposable on itself!');

        markTracked(t);
        if (!this._isDisposed) {  //没有释放就可以添加
            this._toDispose.add(t);
        }

        return t;
    }
}

export abstract class Disposable implements IDisposable {

    static readonly None = Object.freeze<IDisposable>({ dispose() { } });

    private readonly _store = new DisposableStore();

    constructor() {
        trackDisposable(this);
    }

    public dispose(): void {
        markTracked(this);

        this._store.dispose();
    }

    protected _register<T extends IDisposable>(t: T): T {
        if ((t as unknown as Disposable) === this) {
            throw new Error('Cannot register a disposable on itself!');
        }
        return this._store.add(t);
    }
}
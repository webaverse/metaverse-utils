const TRACK_DISPOSABLES = false;
const __is_disposable_tracked__ = '__is_disposable_tracked__';

function markTracked(x: any) {
    if (!TRACK_DISPOSABLES)
        return;

    if (x) {
        x[__is_disposable_tracked__] = true;
    }
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

export class Disposable {
    private _store: DisposableStore;
    isDisposable: boolean;
    constructor() {
        this._store = new DisposableStore();
        this.isDisposable = true;
    }

    dispose() {
        markTracked(this);

        this._store.dispose();
    }

    _register(t: Disposable) {
        if (!this.isDisposable) {
            throw new Error('Cannot register a disposable on itself!');
        }
        return this._store.add(t);
    }
}
import { EventHandler } from './eventhandler';
import { v4 as uuidv4 } from 'uuid';

export class Thing extends EventHandler {
  uuid: string;
  id: string;
  name: string;
  alias: string;
  isThing: boolean;
  parent: Thing | any;
  children: Thing[];
  meta: any;
  needsUpdate: boolean = true;
  _renderObject: Thing | any;
  _useData: {};
  tag: string = "default";
  _level: number = 0;
  _expanded: boolean = false;
  type: string;
  constructor(opts?: any) {
    super();
    opts = opts || {};
    this.uuid = uuidv4();
    this.id = this.uuid;
    this.name = opts.name || "未命名";
    this.type = opts.type || "未命名";
    this.alias = opts.alias || "";
    this.isThing = true
    this.parent = null;
    this.children = [];
    this.meta = undefined;
    this._renderObject = null;
    this._useData = {};
    this.tag = "untagged";

    this.on("set", (name: string, oldValue: any, newValue: any) => {
      this.fire("set_" + name, name, oldValue, newValue);
    });

    /**其他扩展属性 */
    for (const key in opts) {
      if (opts.hasOwnProperty(key)) {
        if (!(<any>this)[key]) {
          (<any>this)[key] = opts[key]
        }
      }
    }
  }

  set level(val) {
    this._level = val;
    for (let i = 0; i < this.children.length; i++) {
      this.children[i].level = this.level + 1;
    }
  }

  get level() {
    return this._level;
  }

  get isLeaf(): boolean {
    return this.children.length <= 0;
  }

  add(...thing: Thing[] | any): any | this {
    for (var i = 0; i < thing.length; i++) {
      const child = thing[i]
      if (child === this) {
        console.error("Thing.add: 自己不能作为自己的子节点", child);
        return this;
      }
      if (child && this.isThing) {

        if (child.parent) {
          child.parent.remove(child);
        }

        child.parent = this;
        child.level = this.level + 1;
        this.children.push(child);

        this.fire("add", child);
      } else {
        console.error("Thing.add:不是Thing类型", child);
      }
      return this;
    }
    return this;
  }

  remove(...thing: Thing | any): any | this {
    if (thing.length > 1) {
      for (var i = 0; i < thing.length; i++) {
        this.remove(thing[i]);
      }
      return this;
    }

    if (thing.parent) {
      //自身从父节点移除
      this.parent.remove(thing);
    }

    var index = this.children.indexOf(thing);

    if (index !== -1) {
      thing.parent = null;
      this.children.splice(index, 1);

      this.fire("remove", thing);
    }

    return this;
  }


  foreach(cb: (thing: Thing) => {} | any) {
    cb(this);
    var children = this.children;
    for (let i = 0; i < children.length; i++) {
      children[i].foreach(cb);
    }
  }

  getObjectByProperty(name: string, value: any): any {

    if ((<any>this)[name] === value) return this;

    for (var i = 0, l = this.children.length; i < l; i++) {

      var child = this.children[i];
      if (!child.getObjectByProperty)
        continue
      var object: any = child.getObjectByProperty(name, value);

      if (object !== undefined) {
        return object;
      }
    }

    return undefined;

  }

  getObjectById(id: any) {
    return this.getObjectByProperty('id', id);
  }

  getObjectByName(name: any) {
    return this.getObjectByProperty('name', name);
  }

  /**
 * 生成属性的set/get方法
 * @param {string} name
 * @param {function} setFunc
 * @param {boolean} skipEqualsCheck
 */
  defineProperty(name: string | number | symbol, setFunc: any, skipEqualsCheck = true) {
    Object.defineProperty(this, name, {
      get: () => {
        return (<any>this._useData)[name];
      },
      set: (value) => {
        var data = this._useData;
        var oldValue = (<any>data)[name];
        if (!skipEqualsCheck && oldValue === value) return;
        (<any>data)[name] = value;
        if (setFunc) setFunc.call(this, value, oldValue);
      },
      configurable: true
    })
  }

  get data() {
    var record = null;//this.system.store[this.entity.getGuid()];
    return record;// /??* record.data  :*/ null;
  }

  _buildAccessor(obj: any, schema: any) {
    schema = Array.isArray(schema) ? schema : [schema];
    schema.forEach(function (descriptor: { name?: string }) {
      // If the property descriptor is an object, it should have a `name`
      // member. If not, it should just be the plain property name.
      var name: string = descriptor.name ? descriptor.name : descriptor as string;

      Object.defineProperty(obj, name, {
        get: function () {
          return this.data[name];
        },
        set: function (value) {
          var data = this.data;
          var oldValue = data[name];
          data[name] = value;
          this.fire('set', name, oldValue, value);
        },
        configurable: true
      });
    });

    obj._accessorsBuilt = true;
  }

  buildAccessor(name: any, bindObject = this) {
    if (!bindObject)
      return
    Object.defineProperty(bindObject, name, {
      get: function () {
        return (<any>bindObject)[`_${name}`];
      },
      set: function (value) {
        var oldValue = (<any>bindObject)[`_${name}`];
        (<any>bindObject)[`_${name}`] = value;
        bindObject.fire('set', `${name}`, oldValue, value);
      },
      configurable: true
    });
  }

  buildAccessors(schema: any[], bindObject: this | undefined) {
    schema.forEach((descriptor: any) => {
      this.buildAccessor(descriptor, bindObject)
    });
    (<any>bindObject)._accessorsBuilt = true;
  }

  toJSON() {

  }
}



export default Thing

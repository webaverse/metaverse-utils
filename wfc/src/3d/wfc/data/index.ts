import ceqiang from './ceqiang'
import cezhu from './cezhu'
import dice from './dice'
import dice1 from './dice1'
import diceqiang from './diceqiang'
import dicezhu from './dicezhu'
import dicezhu1 from './dicezhu1'
import dijiao from './dijiao'
import dimian from './dimian'
import dingce from './dingce'
import dingcejiao from './dingcejiao'
import dingcejiao1 from './dingcejiao1'
import dingmian from './dingmian'
import dingmian1 from './dingmian1'
import empty from './empty'
import gaodimian from './gaodimian'
import { createQuaterModule } from './utils';

const base = {
    ceqiang,
    cezhu,
    dice,
    dice1,
    diceqiang,
    dicezhu,
    dicezhu1,
    dijiao,
    dimian,
    dingce,
    dingcejiao,
    dingcejiao1,
    dingmian,
    dingmian1,
    gaodimian,
    empty,
}

const modules = []
for (const key in base) {
    const module = base[key];
    if (module.enableVRotation)
        for (let i = 0; i < 4; i++) {
            modules.push(createQuaterModule(module, i))
        }
    else {
        module.modelName = module.name;
        modules.push(module);
    }
}
for (const key in modules) {
    modules[key].probability = Math.random() / 2 + 0.5
}

const newModules = () => [...modules];
const allModules = {}
modules.forEach(m => allModules[m.name] = m)
export { modules, newModules, allModules };
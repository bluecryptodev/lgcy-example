import LgcyWeb from '../index';
import utils from '../utils';
import semver from 'semver';

export default class Plugin {

    constructor(lgcyWeb = false) {
        if (!lgcyWeb || !lgcyWeb instanceof LgcyWeb)
            throw new Error('Expected instance of LgcyWeb');
        this.lgcyWeb = lgcyWeb;
        this.pluginNoOverride = ['register'];
    }

    register(Plugin) {
        let pluginInterface = {
            requires: '0.0.0',
            components: {}
        }
        let result = {
            plugged: [],
            skipped: []
        }
        const plugin = new Plugin(this.lgcyWeb)
        if (utils.isFunction(plugin.pluginInterface)) {
            pluginInterface = plugin.pluginInterface()
        }
        if (semver.satisfies(LgcyWeb.version, pluginInterface.requires)) {
            for (let component in pluginInterface.components) {
                if (!this.lgcyWeb.hasOwnProperty(component)) {
                    // TODO implement new sub-classes
                    continue
                }
                let methods = pluginInterface.components[component]
                let pluginNoOverride = this.lgcyWeb[component].pluginNoOverride || []
                for (let method in methods) {
                    if (method === 'constructor' || (this.lgcyWeb[component][method] &&
                        (pluginNoOverride.includes(method) // blacklisted methods
                            || /^_/.test(method)) // private methods
                    )) {
                        result.skipped.push(method)
                        continue
                    }
                    this.lgcyWeb[component][method] = methods[method].bind(this.lgcyWeb[component])
                    result.plugged.push(method)
                }
            }
        } else {
            throw new Error('The plugin is not compatible with this version of LgcyWeb')
        }
        return result
    }
}


import { conDebug } from "utils";
import { BaseModule, FullModCount, XS_ModuleName } from "./BaseModule";
import { ActivityModule } from "./MActivity";
import { ChatroomModule } from "./MChatroom";
import { CommandsModule } from "./MCommand";
import { DataModule } from "./MData";
import { ArousalModule } from "./MArousal";
import { modules } from "./ModulesDict";

export class ModuleLoader {
    public static modules: { [key: string]: BaseModule } = modules;
    static mList: [BaseModule] | undefined;
    public static modulesCount: number = 0;
    public static CompleteLoadingSuccessful: boolean = false;


    /**
     * 加载模块   Loader对外入口.
     */
    public static LoadModules(): number {
        const moduleC = this.generateModule();

        // 如果模块列表存在
        if (typeof this.mList !== "undefined") {
            // 对模块列表进行排序，按照优先级升序排列
            this.mList
                .sort((a, b) => a.priority - b.priority)
                .forEach((m) => {
                    // 加载模块
                    m.Load();
                    conDebug(`模块 ${m.moduleName} 加载完成`);
                });
        }

        if (this.CheckModulesLoaded(moduleC)) {
            this.CompleteLoadingSuccessful = true;
            window.XSActivity_Loaded = true;
        }
        return moduleC
    }

    public static CheckModulesLoaded(moduleCount: number): boolean {
        if (moduleCount != FullModCount) return false;
        if (ModuleLoader.mList === undefined) return false;
        for (const m of ModuleLoader.mList) {
            if (!m.Loaded) return false;
        }
        return true;
    }// 该方法在加载模块完成之后调用，确保mList中的所有模块都已加载。

    /**
     * 将模块添加到模块数组中
     * @param module 要添加的模块对象
     */
    private static pushToModules(module: BaseModule): void {
        this.modules[module.moduleName] = module;
        if (typeof this.mList !== "undefined") {
            this.mList.push(module);
        } else {
            this.mList = [module];
        }

        this.modulesCount++;
    }

    public static ModuleMap: { [mName in XS_ModuleName]: () => void } = {
        Base: () => {
            throw new Error("Base为模块的抽象类，请勿加载");
        },
        ActivityModule: () => {
            this.pushToModules(new ActivityModule());
        },
        ChatroomModule: () => {
            this.pushToModules(new ChatroomModule());
        },
        CommandsModule: () => {
            this.pushToModules(new CommandsModule());
        },
        DataModule: () => {
            this.pushToModules(new DataModule());
        },
        ArousalModule: () => {
            this.pushToModules(new ArousalModule());
        }
    }


    private static generateModule(): number {
        for (const mN in ModuleLoader.ModuleMap) {
            if (mN !== "Base" && this.modules[mN] === undefined) ModuleLoader.ModuleMap[mN as XS_ModuleName]();
        }

        return this.modulesCount;
    }

}
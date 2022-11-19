import count from "./js/count";
import sum from "./js/sum";
import {mul} from "./js/math";
import "./css/index.css";
import "./less/index.less";
import "./sass/index.sass";
import "./sass/index.scss";
import "./stylus/index.styl";
import "./css/iconfont.css";

//测试TreeShaking,只会打包引入的js部分,没引入的部分不打包（生产模式是自动开启的）
console.log(mul(3, 3))
console.log(count(2, 1));
console.log(sum(1, 2, 3, 4));

//css文件默认支持HMR，是因为style-loader实现了这个功能，js文件需要写如下代码才能实现HMR
if (module.hot) {
    //判断是否支持热模块替换功能
    module.hot.accept("./js/count");
    module.hot.accept("./js/sum");
}
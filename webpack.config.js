const path = require("path");//nodejs核心模块，专门用来处理路径问题

module.exports = {
    //入口
    entry: "./src/main.js", //相对路径
    //输出
    output: {
        //文件的输出路径
        //__dirname nodejs的变量，代表当前文件的文件夹目录
        path: path.resolve(__dirname, "dist"),  //绝对路径
        //文件名
        filename: "main.js"
    },
    //加载器
    module: {
        rules: [
            //loader的配置
            {
                test: /\.css$/, //只检测.css文件 $符号表示以什么什么结尾
                use: [  //执行顺序，从右到左(从下到上)
                    "style-loader", //将js中css通过创建style标签添加到html文件中生效
                    "css-loader",   //将css资源编译成commonjs的模块到js中
                ],
            },
            {
                test: /\.less$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'less-loader',  //将less编译成css文件
                ],
            }
        ],
    },
    //插件
    plugins: [
        //plugin的配置
    ],
    //模式 development production
    mode: 'development'
}
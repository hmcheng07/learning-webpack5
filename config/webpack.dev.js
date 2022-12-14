const path = require("path");//nodejs核心模块，专门用来处理路径问题
const os = require("os");
//引入eslint插件
const ESLintPlugin = require('eslint-webpack-plugin');
//引入htmlwebpack插件
const HtmlWebpackPlugin = require('html-webpack-plugin');

const threads = os.cpus().length;   //获取cpu核心数

module.exports = {
    //入口
    entry: "./src/main.js", //相对路径
    //输出
    output: {
        //文件的输出路径
        //开发模式没有输出
        path: undefined,  //绝对路径
        //文件名
        filename: "static/js/[name].js",
        //给打包输出的其他文件命名 (例如：使用main.js中 /* webpackChunkName: "math" */ 中定义的名称)
        chunkFilename: "static/js/[name].chunk.js",
        //图片、字体等通过type:asset处理资源命名方式
        assetModuleFilename: "static/media/[hash:10][ext][query]",
        //自动清空上次打包的内容(把dist目录先删除，再进行打包)
        //clean: true   //开启devServer不会产生编译打包的文件，此配置不再需要
    },
    //加载器
    module: {
        rules: [
            //loader的配置
            {
                //每个文件只能被其中一个loader配置处理，匹配上了之后就不在往下寻找loader，提升效率
                oneOf: [
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
                    },
                    {
                        test: /\.s[ac]ss$/,
                        use: [
                            'style-loader',
                            'css-loader',
                            'sass-loader',  //将sass编译成css文件
                        ],
                    },
                    {
                        test: /\.styl$/,
                        use: [
                            'style-loader',
                            'css-loader',
                            'stylus-loader',  //将stylus编译成css文件
                        ],
                    },
                    {
                        //图片资源处理，webpack5之后支持自动对图片进行处理，以下配置是为了优化图片处理而配置的
                        test: /\.(png|jpe?g|gif|webp|svg)$/,
                        type: 'asset',
                        parser: {
                            dataUrlCondition: {
                                //小于20kb的图片转base64 (具体大小根据实际情况配置，一般配置为小于10kb比较好，图片体积越大转成base64编码后，体积反而会大很多)
                                //优点：减少请求数量     缺点：体积会更大
                                maxSize: 20 * 1024 // 20kb
                            }
                        },
                        // generator: {
                        //     //输出图片名称
                        //     //[hash]图片名哈希值 [ext]图片的扩展名 [query]访问路径的查询参数
                        //     filename: "static/images/[hash:10][ext][query]"
                        // }
                    },
                    {
                        //字体图标资源处理
                        test: /\.(ttf|woff2?|mp3|mp4|avi)$/,
                        type: 'asset/resource',
                        // generator: {
                        //     filename: "static/media/[hash:10][ext][query]"
                        // }
                    },
                    {
                        test: /\.js$/,
                        //include和exclude，二选一即可
                        // exclude: /node_modules/, //排除不需要处理的项
                        include: path.resolve(__dirname, "../src"), //只处理src下的文件，其他文件不处理
                        use: [
                            {
                                loader: "thread-loader",    //开启多进程
                                options: {
                                    works: threads, //进程数量
                                }
                            },
                            {
                                loader: 'babel-loader',
                                //以下内容可以写到babel.config.js配置文件中
                                options: {
                                    // presets: ['@babel/preset-env']
                                    cacheDirectory: true,    //开启babel缓存
                                    cacheCompression: false, //关闭缓存文件压缩
                                    plugins: ["@babel/plugin-transform-runtime"],    //减小代码体积
                                }
                            }
                        ]
                    }
                ]
            }
        ],
    },
    //插件
    plugins: [
        //plugin的配置
        new ESLintPlugin({
            //检测哪些文件
            context: path.resolve(__dirname, "../src"),
            exclude: "node_modules", //默认值
            cache: true, //开启缓存
            cacheLocation: path.resolve(__dirname, "../node_modules/.cache/eslintCache"),
            threads,    //开启多进程和设置进程数量
        }),
        new HtmlWebpackPlugin({
            //配置html模板文件，以public/index.html文件创建新的html文件
            //新的html文件特点: 1.结构和原来一致 2.自动引入打包输出的资源
            template: path.resolve(__dirname, "../public/index.html"),
        })
    ],
    //开发服务器 npx webpack serve --config ./config/webpack.dev.js
    devServer: {
        host: "localhost",  //启动服务器域名
        port: "3000",   //启动服务器端口号
        open: true,  //是否自动打开浏览器
        hot: true   //开启HMR（默认值）
    },
    //模式 development production
    mode: 'development',
    devtool: "cheap-module-source-map"  //只有行的映射信息
}
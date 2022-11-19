const path = require("path");//nodejs核心模块，专门用来处理路径问题
const os = require("os");

//引入eslint插件
const ESLintPlugin = require('eslint-webpack-plugin');
//引入html-webpack插件
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserWebpackPlugin = require("terser-webpack-plugin");

const threads = os.cpus().length;   //获取cpu核心数

//获取处理样式的loader
function getStyleLoader(loaderType){
    return [  //执行顺序，从右到左(从下到上)
        MiniCssExtractPlugin.loader, //将style-loader调整为MiniCssExtractPlugin.loader，生成单独的css样式文件
        "css-loader",   //将css资源编译成commonjs的模块到js中
        {
            loader: "postcss-loader",
            options: {
                postcssOptions: {
                    plugins: [
                        "postcss-preset-env",   //能解决大多数样式兼容性问题
                    ]
                }
            }
        },
        loaderType
    ].filter(Boolean); //.filter(Boolean)会把传入的undefine的值过滤掉
}

module.exports = {
    //入口
    entry: "./src/main.js", //相对路径
    //输出
    output: {
        //文件的输出路径
        //__dirname nodejs的变量，代表当前文件的文件夹目录
        path: path.resolve(__dirname, "../dist"),  //绝对路径
        //文件名
        filename: "static/js/main.js",
        //自动清空上次打包的内容(把dist目录先删除，再进行打包)
        clean: true
    },
    //加载器
    module: {
        rules: [
            //loader的配置
            {
                oneOf: [
                    {
                        test: /\.css$/, //只检测.css文件 $符号表示以什么什么结尾
                        use: getStyleLoader(),
                    },
                    {
                        test: /\.less$/,
                        use: getStyleLoader("less-loader"),
                    },
                    {
                        test: /\.s[ac]ss$/,
                        use: getStyleLoader("sass-loader"),
                    },
                    {
                        test: /\.styl$/,
                        use: getStyleLoader("stylus-loader"),
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
                        generator: {
                            //输出图片名称
                            //[hash]图片名哈希值 [ext]图片的扩展名 [query]访问路径的查询参数
                            filename: "static/images/[hash:10][ext][query]"
                        }
                    },
                    {
                        //字体图标资源处理
                        test: /\.(ttf|woff2?|mp3|mp4|avi)$/,
                        type: 'asset/resource',
                        generator: {
                            filename: "static/media/[hash:10][ext][query]"
                        }
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
                                    cacheCompression: false //关闭缓存文件压缩
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
            cacheLocation: path.resolve(__dirname, "../node_modules/.cache/eslintCache"),   //缓存文件的路径
            threads,    //开启多进程和设置进程数量
        }),
        new HtmlWebpackPlugin({
            //配置html模板文件，以public/index.html文件创建新的html文件
            //新的html文件特点: 1.结构和原来一致 2.自动引入打包输出的资源
            template: path.resolve(__dirname, "../public/index.html"),
        }),
        new MiniCssExtractPlugin({
            filename: "static/css/main.css"
        }),
        //这两个插件可以放置到optimization中，效果一样
        // new CssMinimizerPlugin(),
        // new TerserWebpackPlugin({
        //     parallel: threads,  //开启多进程和设置进程数量
        // })
    ],
    optimization: {
        //压缩的操作（webpack5推荐放在这里）
        minimizer: [
            //压缩css
            new CssMinimizerPlugin(),
            //压缩js
            new TerserWebpackPlugin({
                parallel: threads,  //开启多进程和设置进程数量
            })
        ]
    },
    //模式 development production
    mode: 'production',
    devtool: "source-map"   //包含行与列的映射信息
}
//执行命令 npx webpack --config ./config/webpack.prod.js
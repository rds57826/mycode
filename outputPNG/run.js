let fs = require('fs'),
    PNG = require('pngjs').PNG,
    outputPath = 'output'

let args = process.argv
let pngFileName = args[2]

// 判断png文件和json文件是否存在
if (
    typeof pngFileName === 'undefined' ||
    pngFileName.slice(-3).toLowerCase() !== 'png'
) {
    console.log('===ERROR:没有可以编辑的PNG文件===')
    return
}

if (!fs.existsSync(pngFileName)) {
    console.log('===ERROR:PNG文件不存在===')
    return
}

let jsonFileName = pngFileName.slice(0, pngFileName.lastIndexOf('.')) + '.json'

console.log(jsonFileName)

if (!fs.existsSync(jsonFileName)) {
    console.log('===ERROR:JSON文件不存在===')
    return
}

// 创建输出目录
if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath)
}

let outputSubNum = 1
let outputSubPath = outputPath + '/' + outputSubNum
while (fs.existsSync(outputSubPath)) {
    outputSubNum++
    outputSubPath = outputPath + '/' + outputSubNum
}

fs.mkdirSync(outputSubPath)

// 分离雪碧图
fs.createReadStream(pngFileName)
    .pipe(
        new PNG({
            filterType: 4
        })
    )
    .on('parsed', function() {
        // 获取json数据
        let jsonDatas = JSON.parse(fs.readFileSync(jsonFileName, 'utf-8'))

        jsonDatas.frames.forEach(data => {
            let fileName = data.filename,
                position = data.frame

            var newPng = new PNG({
                filterType: 4,
                width: position.w,
                height: position.h
            })
            
            this.bitblt(
                newPng,
                position.x,
                position.y,
                position.w,
                position.h,
                0,
                0
            )

            var dst = fs.createWriteStream(outputSubPath + '/' + fileName)
            newPng.pack().pipe(dst)

        })
        console.log('===SUCCESS：雪碧图分离成功，目录' + outputSubPath + '/===')
    })

// let json = fs.readFileSync('')

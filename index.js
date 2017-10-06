var fileSizeLimit = 1024 * 1024 * 1024 // 1G
var maxDisplayDepth = 2;
var catchLog = false
var cutDetailLimit = 50

var fs = require('fs')
var path = require('path')

function pretty(x){
    var unit = 1024
    if (Math.floor(x / unit / unit / unit) == 0){
        if (Math.floor(x / unit / unit) == 0){
            if (Math.floor(x / unit) == 0){
                return x + 'B'
            }else return Math.floor(x/unit) + 'K'
        }else{ return Math.floor(x/unit/unit) + 'M' }
    }else return Math.floor(x/unit/unit/unit) + 'G'
}

var filesCollect = []

function checkDir(dir, level){
//    console.log("checkDir", dir, level)
    if (level >= maxDisplayDepth + 8)return 0
    var dirStat = fs.lstatSync(dir)
            var retSize = 0
    if (dirStat){
//        if(level < maxDisplayDepth){ console.log(dir, dirStat) }
        if(dirStat.isFile()){
            retSize = dirStat.size
        }else{
                try{
                var files = fs.readdirSync(dir)
                    if (files){
            if (level < maxDisplayDepth)console.log('looking into ', dir, ' with ', files.length, ' file(s) ...')
                        for (var file of files){
                            var filePath = path.join(dir, file)
                                var ret = checkDir(filePath, level + 1)
                                retSize += ret
                        }
                }else{
                    console.log("readdir error", files)
                }
                }catch(e){
                    if (catchLog)
                    console.log(dir, e)
                }
                retSize += dirStat.size
        }
    }else{
        console.log('dir stat error', stat)
    }
//    if (level < maxDisplayDepth){ console.log(dir, "dir sum size:", retSize, pretty(retSize)) }
    filesCollect.push({
        'dir': dir,
        'size': retSize
    })
    return retSize
}

var startDir = process.cwd() 
if (process.argv.length > 2){
    startDir = process.argv[2]
}

checkDir(startDir, 0)
    



filesCollect.sort(function(a, b){
    if (a.size == b.size)
        return a.dir - b.dir
    else return b.size - a.size
})

var cut = Math.floor(filesCollect.length * 0.1)
if (cut > cutDetailLimit)cut = cutDetailLimit
filesCollect.splice(cut, filesCollect.length - cut)

console.log('\n\n\nresult:\n')
for (var i in filesCollect){
    console.log(pretty(filesCollect[i].size), filesCollect[i].dir)
}


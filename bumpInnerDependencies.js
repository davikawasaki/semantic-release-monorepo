// get packages and loop through each of them
// read package N json dependencies and get their versions
// loop through json dependencies and see if any of them are one of the monorepo packages
// if it's, read that monorepo package package.json to get its version. compare the version and if it's different, copy the version from the package.json version to the dependency version inside the other package and save the file
// run npm i or npx lerna bootstrap to validate changes

const fs = require('fs')

const _getPackageFolders = (source) => 
    fs.readdirSync(source, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)

const _readPackageVersion = (source) =>
    require(source).version

const _readDependenciesVersions = (source, type = 'dependencies') =>
    require(source)[type]

const main = () => {
    const pckgs = _getPackageFolders('packages/')
    pckgs.forEach(pckg => {
        const depObj = _readDependenciesVersions(`./packages/${pckg}/package.json`)
        if (depObj) {
            Object.keys(depObj)
                .forEach(key => {
                    if (pckgs.includes(key)) {
                        const depVersion = _readPackageVersion(`./packages/${key}/package.json`)
                        if (depVersion !== depObj[key].replace('~','').replace('^','')) {
                            console.log(`[INFO] Package ${key} version ${depVersion} - Dep version ${depObj[key]}`)
                            let pckgObj = require(`./packages/${pckg}/package.json`)
                            pckgObj.dependencies[key] = depVersion
                            fs.writeFileSync(`./packages/${pckg}/package.json`, JSON.stringify(pckgObj, null, 2))
                        }
                    }
                })
        }
    })
}

main()

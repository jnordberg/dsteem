import {exec, exit} from 'shelljs'

exec('wintersmith build -X') || exit(1)

exec('uglifyjs build/app.js' +
     ' --source-map "content=inline,url=app.js.map,filename=build/app.js.map"' +
     ' --compress "dead_code,collapse_vars,reduce_vars,keep_infinity,drop_console,passes=2"' +
     ' -o build/app.js')

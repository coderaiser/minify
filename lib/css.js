/* сжимаем код через clean-css */
exports._cleanCSS=function(pData){
    'use strict';
     /* connecting cleanCSS,
      * if we can't find it -
      * return false
      */
     var cleanCSS;
     try{
        cleanCSS = require('clean-css');
    }catch(error){
        console.log('can\'n load clean-css \n'                          +
            'to use css-minification you need to install clean-css \n'  +
                'npm install clean-css\n'                               +
                'https://github.com/GoalSmashers/clean-css');
        return pData;
    }
        /* Сохраняем весь стиль в одну переменную*/            
    return cleanCSS.process(pData);
};
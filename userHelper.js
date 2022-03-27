const path = require('path');
const cookies = new Map();

const users = new Map();

let user_files = NIL.IO.getFilesList("./Data/users/");

for(var i in user_files){
    if(user_files[i].isFile()){
        try{
            let file = JSON.parse(NIL.IO.readFrom(`./Data/users/${i}`)); 
            users.set(file.name,file);
        }catch(err){
            console.log(err);
        }
    }
}

function if_login(req){
    let cookie = req.cookies.user_id;
    return cookies.has(cookie);
}

function getUser(req){
    let name = cookies.get(req.cookies.user_id);
    if(users.has(name)){
        return {
            name,
            level : users.get(name).permission,
            pic : NIL.IO.exists(path.join(__dirname, `./public/static/picture/${name}.png`))?`/static/picture/${name}.png`:`/static/picture/avatar-1.jpg`
        }
    }else{
        return {
            name:'未登录用户',
            level : -1,
            pic : `/static/picture/avatar-1.jpg`
        }
    }

}

function setCookie(id,user){
    if(users.has(user)){
        cookies.set(id,user)
    }else{

    }
}

function if_pwd_right(user,pwd){
    if(users.has(user)){
        return users.get(user).pwd == pwd;
    }else{
        return false;
    }
}

function delCookie(id){
    cookies.delete(id);
}

module.exports = {
    getUser,
    if_login,
    setCookie,
    delCookie,
    if_pwd_right
}
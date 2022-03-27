//引入所需要的插件
var express = require('express');
const md5 = require('md5-node');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
var app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json()); 
app.use(cookieParser(md5('nilbridge')));
const userhelper = require('./userHelper');

function checkFile(file, text) {
    if (NIL.IO.exists(path.join(__dirname, file)) == false) {
        NIL.IO.WriteTo(path.join(__dirname, file), text);
    }
}

if (NIL.IO.exists("./Data/users") == false) {
    NIL.IO.createDir("./Data/users");
}

if(Object.keys(NIL.IO.getFilesList("./Data/users/")).length == 0){
    NIL.IO.WriteTo('./Data/users/root.json',JSON.stringify(get_new_user('root','123456',2)));
}

function get_new_user(name,pwd,permission = 0){
    return {name,pwd:md5(pwd),permission,sers:[],date:new Date().toDateString()}
}

const menu_sidebar = [
    {
        type: 'label',
        title: '仪表盘',
        icon: {
            has: true,
            path: 'uim uim-airplay'
        },
        path: '/main'
    },
    {
        type: 'label',
        title: '玩家管理',
        icon: {
            has: true,
            path: 'uim uim-th-large'
        },
        path:'/members'
    },
    {
        type: 'dropdown',
        title: '服务器管理',
        children: [],
        icon: {
            has: true,
            path: 'uim uim-line-spacing '
        }
    }
];

const more_sidebar = [
    {
        type: 'label',
        title: '登出',
        icon: {
            has: true,
            path: 'uim uim-angle-left '
        },
        path:'/logout'
    }
]

NIL.SERVERS.forEach((v, k) => {
    menu_sidebar[2].children.push({
        type: 'label',
        title: k,
        path: '/server/'+k,
        icon: {
            has: false
        }
    });
});

const sidebar = {
    基础菜单: menu_sidebar,
    更多: more_sidebar
}

const user_static = new Map();

app.get('/', (req, res) => {
    if(userhelper.if_login(req)){
        res.redirect('/main');
    }else{
        res.render('login.ejs', {});
    }
});

app.get('/members',(req,res)=>{
    if(user_login(req,res))return;
    res.render('layouts.ejs', {
        type:"members",
        sidebar,
        players:NIL._vanilla.get_all(),
        user : userhelper.getUser(req)
    });
});

function GUID() {
    return 'xxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

app.get('/main',(req,res)=>{
    if(user_login(req,res))return;
    res.render('layouts.ejs', {
        type:"main",
        sidebar,
        user :userhelper.getUser(req)
    });
});

app.post('/login',(req,res)=>{
    let user = req.body.user;
    let pwd = req.body.pwd;
    if(userhelper.if_pwd_right(user,pwd)){
        let id = GUID();
        userhelper.setCookie(id,user);
        res.cookie('user_id',id,{httpOnly:true,maxAge:60*1000*60*24});
        user_static.set(user,0);
        res.json({code:200});
    }else{
        res.json({code:407});
    }
});

app.get('/lockscreen',(req,res)=>{
    let user = userhelper.getUser(req);
    user_static.set(user.name,5);
    res.render('lockScreen.ejs',{user});
});

app.post('/lockscreen',(req,res)=>{
    let user = userhelper.getUser(req);
    let pwd = req.body.pwd;
    if(userhelper.if_pwd_right(user.name,pwd)){
        user_static.set(user.name,0);
        res.json({code:200});
    }else{
        res.json({code:407});
    }
});

function user_login(req,res){
    if(userhelper.if_login(req)==false){
        res.redirect('/');
        return true;
    }
    let user = userhelper.getUser(req);
    switch(user_static.get(user.name)){
        case 0:
            return false;
        case 5:
            res.render('lockScreen.ejs',{user});
            return true;
    }
}

app.get('/server/:ser',(req,res)=>{
    if(user_login(req,res))return;
    let ser = req.params.ser;
    if(NIL.SERVERS.has(ser)){
        res.destroy();
    }else{
        res.redirect("/404");
    }
});

function getQQStatus(){
    let qqs = NIL.bots.getAll();
    let objs = {};
    qqs.forEach(q=>{
        objs[qq] = {};
        let tmp = NIL.bots.getBot(qq);
    });
}


app.get("/logout",(req,res)=>{
    res.clearCookie('user_id');
    res.redirect("/");
})

app.get("*",(req,res)=>{
    res.render('404.ejs',{});
});

let server = app.listen(8080);

module.exports = {
    onStart(api){
    },
    onStop(){
        server.close();
    }
}
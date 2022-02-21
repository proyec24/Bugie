const express = require('express');
const wait = {waitUntil: 'domcontentloaded'};
const puppeteer = require('puppeteer-extra');
const cors = require("cors");
const plugin = require("puppeteer-extra-plugin-stealth");
const { Console } = require('console');
puppeteer.use(plugin());
puppeteer.use(require('puppeteer-extra-plugin-anonymize-ua')());
    puppeteer.use(require('puppeteer-extra-plugin-user-preferences')({
        userPrefs: {
            webkit: {
                webprefs: {
                    default_font_size: 16
                }
            }
        }
    }));
const app = express();
var corsOptions = {
    origin: 'http://localhost:3000/',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(cors());
app.options('/products/:id', cors()) // enable pre-flight request for DELETE request
app.get('/', async (req, res) => {
    console.log("hola");
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    
    let browser = await puppeteer.launch({ 
        args: [
            '--disable-gpu',
            '--disable-dev-shm-usage',
            '--disable-setuid-sandbox',
            '--no-first-run',
            '--no-sandbox',
            '--no-zygote',
            '--deterministic-fetch',
            '--disable-features=IsolateOrigins',
            '--disable-site-isolation-trials',
            // '--single-process',
        ],
        headless:false,
    })
    console.log("vivito");
    //abrir navegador
    let page = await browser.newPage();
    console.log("va");
    await page.setDefaultNavigationTimeout(0); 
    
    //linea bendita que se hace pendejo al google jajajaja
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36');
    //Convierte el JSON de Bugie en un arreglo para leer
    let get = req.query.options || '';
    let getArray = [];
    getArray=JSON.parse(get); 

    let account = "";
    let password = "";

    if(getArray.account === "0"){
        account = "daniel.growthy@gmail.com";
        password = "p1e2p1e2";
    }else{
        account = "emmanuelibarratorres14@gmail.com";
        password = "Amazon.444";
    }
    console.log("Es la cuenta de " + account + " y la contraseña es " + password);

    console.log("va");
    await page.goto("https://secure.indeed.com/account/login?hl=es_MX&co=MX&continue=https%3A%2F%2Fmx.indeed.com%2F&tmpl=desktop&service=my&from=gnav-util-homepage&jsContinue=https%3A%2F%2Fmx.indeed.com%2F&empContinue=https%3A%2F%2Faccount.indeed.com%2Fmyaccess",wait)
    await page.waitForSelector('#login-email-input',wait);
    await page.type('#login-email-input', account, { delay: 5 });
    await page.click('#login-email-input');
    console.log("va");
    await page.waitForSelector('#login-password-input', { visible: true });
    await page.type('#login-password-input', password, { delay: 5 });
    await page.waitForSelector('#login-submit-button', { visible: true });
    console.log("va");
    await page.click('#login-submit-button');
    console.log("aqui ando");
    const search= getArray.values;
    console.log(search);
    await page.screenshot({path:"trabado1.jpg"})
    await delay(60000);
    await page.goto("https://employers.indeed.com/j#jobs?title="+search);
    await page.screenshot({
        path: "prueba2.jpg"
        });
    console.log("sigo vivo")        
    //busca el trabajo
    let listCandidates = [];

    await page.waitForSelector(".jobs-JobsTab-ListControl",{visible:true})
    console.log("Comida rica");
    const flag = await page.evaluate(()=>{
        let status = true;
        const values2 = document.querySelectorAll(".HanselEmptyState-container");
        if(values2.length == 1){
            status = false;
        }

        return status;
    });

    console.log("El trabajo se encuentra: " + flag);
    let works;
    if(flag){
        await page.waitForSelector(".css-i8euih",{visible:true});
        await page.waitForSelector(".css-zsw846");
        works= await page.evaluate(()=>{
            const searchValue = document.querySelector(".css-i8euih").defaultValue;
            const values = document.querySelectorAll(".OneViewJobListItem-title-link");
            console.log("Values 111: " + values);
            const array = [];
            if(values.length > 1){
                values.forEach(element => {
                    console.log("hola2");
                    console.log(searchValue.toLowerCase());
                    console.log (element.innerText.toLowerCase());
                    if(element.innerText.toLowerCase() === searchValue.toLowerCase()){
                        console.log("hola");
                        array.push(element.getAttribute('href'));
                    }
                });
            }else{
                console.log("hola");
                array.push(values[0].getAttribute('href'));
            }
            
            console.log(array);
            return array;
        });
        console.log("Works 130: " + works);
        let text = await allCandidates(page,works);
        console.log("Text 132: " + text);
        
        if(text.length > 0){
            console.log("Entro al text.length 135");
            await page.goto("https://employers.indeed.com"+text);
            await page.waitForSelector('.cpqap-CandidateCell-name-text');
            const pages = await page.evaluate(()=>{
                return  document.querySelectorAll(".cpqap-Pagination-page").length;
            })
            let candidates = [];
            let Pagination = [];
            for (let j=1; j<=pages+1;j++){
                Pagination.push('https://employers.indeed.com'+text+"&p="+j);
            }
            console.log(Pagination);
            for (const iterator of Pagination) {
                await page.goto(iterator);
                await page.waitForSelector(".cpqap-CandidateCell-name-text");
                let listCandidates = await page.evaluate(()=>{
                    const values = document.querySelectorAll(".cpqap-CandidateCell-name-text");
                    const array = [];
                    if(document.querySelector(".cpqap-ScreenerQuestions-preferred")){
                        const filtros = document.querySelectorAll('.cpqap-ScreenerQuestions-preferred');
                        let i=0;
                        values.forEach(element=>{
                            let rfilter =[];
                            rfilter = filtros[i].innerText.split(" ",1);
                            console.log(rfilter)
                            array.push({
                                id:element.getAttribute('href'),
                                filtros: rfilter[0],
                            });
                            i++;
                        })
                    }else{
                        values.forEach(element=>{
                            let rfilter =[];
                            rfilter = "N/A";
                            console.log(rfilter)
                            array.push({
                                id:element.getAttribute('href'),
                                filtros: rfilter[0],
                            });
                        })
                    }
                    
                    return array;
                })
                console.log(listCandidates);
                candidates.push(listCandidates);
            }
            console.log(candidates);
            let i=0;
            for (let element of candidates) {
                i++;
                element=await singleCandidate(page,element);
            }
            for (const iterator of candidates) {
                for (const element of iterator) {
                    listCandidates.push(element);
                }
            }
        }else{
            console.log("No hay Candidatos");
            let vacio = {name:"Sr2", filtros: "Sr2", status: "Sr2"};
            listCandidates.push(vacio);
        }
        
    }else{
        console.log("No hay empleo");
        let vacio = {name:"Sr1", filtros: "Sr1", status: "Sr1"};
        listCandidates.push(vacio);
    }
    
    
    res.writeHead(202,{
        "Content-type": "application/json",
    });
    console.log(listCandidates);
    res.end(JSON.stringify(listCandidates));
    console.log("hola");
    await browser.close(); 
})
module.exports = app;
function delay(time) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time)
    });
 }
async function allCandidates(page,works){
    let text;
    for (const element of works) {
        await page.goto('https://employers.indeed.com/'+element);
        //css-16edfe3
        await page.waitForSelector(".css-14yg0vp");
        
        text = await page.evaluate(()=>{
            const array = [];
            if(document.querySelector(".css-f0xprd")){
                const values = document.querySelectorAll(".css-f0xprd");
                console.log("Mostrando el Values 214: " + values);
                if(values.length > 1){
                    array.push(values[1].getAttribute('href'));
                    console.log("Mostrando el array " + array);
                }else{
                    array.push(values[0].getAttribute('href'));
                }
                
            }else{
                console.log("No existe, perdón")
            }
            
            return array;
        });
    }
    return text;
} 
async function singleCandidate(page,candidates){
    console.log(candidates)
    let i=0;
    for (let element of candidates) {
      i++;
      await page.goto("https://employers.indeed.com/c"+element.id);
      await page.waitForSelector(".hanselNamePlate-leftPanel h1");
      await page.waitForSelector(".body");
      const singlepeople = await page.evaluate(()=>{
        const singlepeople = {};
        singlepeople.name = document.querySelector(".hanselNamePlate-leftPanel h1").innerText;
        if(document.querySelector("#resume-contact")){
          singlepeople.status = "Rechazado";
        }else{
          singlepeople.status = "Aceptado";
        }
        return singlepeople;
      })
      element.name=singlepeople.name;
      element.status=singlepeople.status;
      console.log(element);    
    }
    console.log(i);
    return candidates;
  } 
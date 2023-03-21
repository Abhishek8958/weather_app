
const API_KEY = "6268440827c6a29efeffd3ac92ce8b08";

const Five_day_in_weak=["Monday","Tuesday","wednesday","thusday","Friday","Saterday","Sunday"];


const search_city_weather= async (search)=>{

   const response= await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${search}&limit=5&appid=${API_KEY}`);
   return response.json();
}

const getcurrentwetherData= async(City_name)=>{

    const city= City_name;
    const response=await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city},{country code}&appid=${API_KEY}`);
    return response.json();
}
const hourlyCast= async function({name}){
     
    const response= await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${name}&appid=${API_KEY}&units=metric`);
     const data= await response.json(); 
    
     return data.list.map((forcast)=>{
       
         const{main:{temp,temp_min,temp_max},dt,dt_txt,weather:[{description,icon}]}=forcast;
         return{temp,temp_max,temp_min,dt,dt_txt,description,icon};
 
     })
     
     
 }

 const tempdecoration=(temp)=>{

       return `${temp?.toFixed(1)}°C`;
 }
const LordCurrentForcast=({name,main:{temp,temp_max,temp_min},weather:[{description:des}]})=>{

    const CityName=document.querySelector("#city-cast");
    CityName.querySelector(".city").textContent=name;
    CityName.querySelector("#temp").textContent=tempdecoration(temp-273.15);
    CityName.querySelector("#des").textContent=des;
    CityName.querySelector("#LH").textContent=`L: ${tempdecoration(temp_min-273.15)}  H:${tempdecoration(temp_max-273.15)}`;
  
}

const creatIcon=(icon)=>` http://openweathermap.org/img/wn/${icon}@2x.png`;

const lordHourlyCast=({main:{temp:Curenttemp},weather:[{icon:current_icon}]},hourlyCast)=>{

   
    const Time_formate= Intl.DateTimeFormat("en",{
        hour12:true,hour:"numeric"
     })
     
    const putinnerstring=(temp,icon,dt_txt,i)=>{

      
        let innerString=" ";
    

       if(i==0){

         innerString= innerString+`<article>
        <h3 class="time">Now</h3>
        <img class="icon" src="${creatIcon(current_icon)}" />
        <p class="h-temp"> ${ tempdecoration(Curenttemp)}</p>
        </aeticle> <br>`;

       

       }
       else{
        innerString+=`<article>
        <h3 class="time">${ Time_formate.format(new Date(dt_txt))}</h3>
        <img class="icon" src="${creatIcon(icon)}" />
        <p class="h-temp"> ${ tempdecoration(temp)}</p>
        </aeticle> <br>`
       }
       

        const hourContainer=document.querySelector(".h-container");
        hourContainer.innerHTML +=innerString;
    }

   

    hourlyCast.then((result)=>{
        let data12hour=result.slice(0,14);
       
        let i=0;
    for(let {temp,icon,dt_txt} of data12hour){
         
       
        putinnerstring(temp,icon,dt_txt,i);
        i++;
    
    }
   
 })  
}

const CalculateFiveDayForcast=(hourlyforcast)=>{
       
    let DaywiseForcast= new Map();
   
    for(let forcast of hourlyforcast){
        const [date]=forcast.dt_txt.split(" ");
       
        const dayofthe_weak= Five_day_in_weak[new Date(date).getDay()];

        
         if(DaywiseForcast.has(dayofthe_weak)){

            
            let forcastDay= DaywiseForcast.get(dayofthe_weak);
             forcastDay.push(forcast);

            
             DaywiseForcast.set(dayofthe_weak,forcastDay);
         }
         else{

            DaywiseForcast.set(dayofthe_weak,[forcast]);
         }
    }


    for(let [key,value] of DaywiseForcast){
        
        const mintemp= Math.min(...Array.from(value, val=> val.temp_min));
        const maxtemp=Math.max(...Array.from(value, val=> val.temp_max));

        DaywiseForcast.set(key, {mintemp,maxtemp,icon: value.find(value=>value.icon).icon})

    }
    

        return DaywiseForcast;
}
const Lord_five_Day_ForCast= (hourlyforcast)=>{

    
    const FiveDayForCast= CalculateFiveDayForcast(hourlyforcast);

    const container=document.querySelector(".five-day-container");
     let tempstring=" ";

     Array.from( FiveDayForCast).map(([key,{mintemp,maxtemp,icon}],index)=>{
       
        if(index<5){
                   
        tempstring+=` <article class="five-day-container-Child">
        <h3 class="Days">${index===0?'Today': key}</h3>
         <img class="five-ican" src=${creatIcon(icon)} alt="icon">
        <p class="five-day-temp-low">${tempdecoration(mintemp)}</p>
        <p class="five-day-temp-high">${tempdecoration(maxtemp)}</p>
    </article>`
        }

     });
     container.innerHTML=tempstring;

}
 
const LordFeel_like = ({main:{feels_like}})=>{
     let container=document.querySelector("#feelLike-cast");
     container.querySelector(".feellike-temp").innerHTML= tempdecoration(feels_like);

}

const Lord_huminity= ({main:{humidity}})=>{

    let header=document.querySelector("#huminity-cast");

    header.querySelector(".hiuminity-value").innerHTML= `${humidity} %`;
}


function debunce(func){

    let timer;
    return (...args)=>{

        clearTimeout(timer);
        timer= setTimeout(()=>{

            func.apply(this,args)
        },500);
    }
}

async function  Get_city(){


    console.log(this.value);

    const currentweather= await  getcurrentwetherData(this.value);
    LordCurrentForcast(currentweather);
   
}
const Function_search= async(event)=>{

    console.log(event);
    console.log(event.data);
    let Data=event.data
    Get_city(Data);
    // city=city+ event.data
    // console.log(city);
   let { value }= event.target;
   
   
  const cityS_list=await search_city_weather(value);
  let options="";
  for(let {lat, lon,name,state,country} of cityS_list){
      options+=`<option data-city-details='${JSON.stringify({lat,lon,name})}' value="${name},${state}, ${country}"></option>`
  }

  document.querySelector("#citys").innerHTML=options;
//   console.log(cityS_list);
    
    
}

const  handle_cityselection=(event)=>{
    console.log(event.target.value);

}
const debunce_search=debunce((event)=>Function_search(event));


const SetImg=(U)=>{

    document.querySelector("body").style.background=`url(${U}) no-repeat`;
    document.querySelector("body").style.backgroundSize="cover";
}

const  setBackground= ()=>{
   

    if(localStorage.getItem("num")%2==0){
        SetImg("img/bg1.jpg");
        let settemp=localStorage.getItem("num");
        settemp= +settemp +1;
        localStorage.setItem("num",settemp);

    }
    else if(localStorage.getItem("num")%2!=0){
        SetImg("img/bg2.jpg");
        let settemp=localStorage.getItem("num");
        settemp= +settemp +1;
        localStorage.setItem("num",settemp);

    }else{
        localStorage.setItem("num",1);
    }
}

document.addEventListener("DOMContentLoaded", async()=>{

    // setBackground();
     var  city="";
     const Search= document.querySelector("#search");
     
       
    //  Search.addEventListener("oninput", debunce_search);
    //  Search.addEventListener("change", handle_cityselection);

    
   
     
     
    const currentweather= await  getcurrentwetherData("chamoli Gopeshwar");
    LordCurrentForcast(currentweather);

    Search.addEventListener("change",Get_city);
    const hourly_Cast= hourlyCast(currentweather);
    lordHourlyCast(currentweather,hourly_Cast);
    LordFeel_like(currentweather);
    Lord_huminity(currentweather);

    setBackground();
   
   
      hourly_Cast.then((result)=>{
        Lord_five_Day_ForCast(result);
      })
   

})
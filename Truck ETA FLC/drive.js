setInterval(displaytime, 1000);
displaytime();
function displaytime() {
    const now = new Date();
    const etTime = now.toLocaleString('en-US', { timeZone: 'America/New_York' });
    let date = etTime.split(',');
    document.getElementsByClassName("time")[0].innerHTML = date[1];
    document.getElementsByClassName("date")[0].innerHTML = date[0];
}


// Send the request to the DirectionsService
let autocomplete1;
let autocomplete2;
let address1Field;
let address2Field;  
let address3Field;
let address4Field;

function initAutocomplete() {
  address1Field = document.querySelector("#cur_location");
  address2Field = document.querySelector("#destination");
  address3Field = document.querySelector("#appointment_time");
  address4Field = document.querySelector("#remain_time");
  // Create the autocomplete object, restricting the search predictions to
  // addresses in the US and Canada.
  autocomplete1 = new google.maps.places.Autocomplete(address1Field, {
    componentRestrictions: { country: ["us"] },
    fields: ["address_components", "geometry"],
    types: ["address"],
  });
  autocomplete2 = new google.maps.places.Autocomplete(address2Field, {
    componentRestrictions: { country: ["us"] },
    fields: ["address_components", "geometry"],
    types: ["address"],
  });
  address1Field.focus();
}


const directionsService = new google.maps.DirectionsService();

// Set up the request parameters
let request = {
  origin: 'New York, NY', // Starting point
  destination: 'Boston, MA', // Destination
  travelMode: 'DRIVING' // Travel mode (can be DRIVING, WALKING, or BICYCLING)
};

var modal = document.getElementById("result");
var span = document.getElementsByClassName("close")[0];
var con = document.getElementsByClassName("modal-finish")[0];

function calc_func() {
    let select_field = document.getElementById("time_format").value;
    if(address1Field.value === "" || address2Field.value === "" || address3Field.value === "" || document.getElementById("remain_time").value === "") {
      alert("try again!"); return ;
    }
    // alert(select_field);
    if(select_field !== "restart" && document.getElementById("remain_time").value > 11) {
      alert("Rewrite Remaining HoS.");
      return;
    }
    request = {
        origin: address1Field.value, // Starting point
        destination: address2Field.value, // Destination
        travelMode: 'DRIVING' // Travel mode (can be DRIVING, WALKING, or BICYCLING)
    };
    
    directionsService.route(request, function(response, status) {
        if (status === 'OK') { // If the response is successful
            const route = response.routes[0];
            const duration = route.legs[0].duration.text; // Get the duration in text format (e.g. "4 hours 15 mins")
            console.log(`Duration: ${duration}`);
            const appoint_time = new Date(address3Field.value);

            let arr = duration.split(' ');
            let tm = 0, ETA;
            for(let i = 0 ; i < arr.length; i+=2) {
              let num = arr[i];
              if(arr[i + 1] === "day") tm += Number(num) * 24 * 3600000;
              if(arr[i + 1] === "hours") tm += Number(num) * 3600000;
              if(arr[i + 1] === "mins") tm += Number(num) * 60000;
            }
            console.log(tm);

            if(select_field === "restart") {
                const st = new Date(address4Field.value);
              
                if(tm <= 8 * 3600000) ETA = st.getTime() + tm;
                if(tm > 8 * 3600000 && tm <= 11 * 3600000) ETA = st.getTime() + tm + 30 * 60000;

                for(let i = 1 ; i <= 10; i++)
                if(tm > i * 11 * 3600000 && tm <= (i + 1) * 11 * 3600000) {
                  console.log(i);
                  ETA = st.getTime() + i * 24 * 3600000 + (tm - i * 11 * 3600000);
                  if(tm - i * 11 * 3600000 > 8) ETA += 30 * 60000;
                }
                
                console.log(ETA);
                if(appoint_time.getTime() >= ETA) {
                  const sh = new Date(ETA);
                  
                  document.getElementsByClassName("modal-header-con")[0].innerHTML = "Status: On Time";
                  document.getElementsByClassName("modal-main-con")[0].innerHTML = "ETA : " + sh.toLocaleDateString() + " " + sh.toLocaleTimeString();
                }
               else {
                  const sh = new Date(ETA);
                  document.getElementsByClassName("modal-header-con")[0].innerHTML = "Status: Late";
                  document.getElementsByClassName("modal-main-con")[0].innerHTML = "ETA : " + sh.toLocaleDateString() + " " + sh.toLocaleTimeString()+ ".<br>" + "The driver is going to be " + Math.floor((ETA - appoint_time.getTime())/ 3600000) + " hours and " + (((ETA - appoint_time.getTime()) % 3600000) / 60000) + " minutes late.";
                }
            }

            else {
              const now = new Date();
              const etTime = now.toLocaleString('en-US', { timeZone: 'America/New_York' });

              const remain = Number(document.getElementById("remain_time").value);
              const st = new Date(etTime);
            
                if(tm <= remain * 3600000) ETA = st.getTime() + tm;
                if(tm <= remain * 3600000 && tm > 8 * 3600000 && tm <= 11 * 3600000) ETA = st.getTime() + tm + 30 * 60000;

                for(let i = 1 ; i <= 10; i++)
                if(tm > i * 11 * 3600000 && tm <= (i + 1) * 11 * 3600000) {
                  console.log(i);
                  ETA = st.getTime() + remain * 3600000 + i * 10 * 3600000 + (i - 1) * 11 * 3600000 + (tm - remain - (i - 1) * 11 * 3600000);
                  if(remain > 8) ETA += 30 * 60000;
                  if(tm - remain - (i - 1) * 11 * 3600000 > 8) ETA += 30 * 60000;
                }
                
                console.log(ETA);
                if(appoint_time.getTime() >= ETA) {
                  const sh = new Date(ETA);
                  
                  document.getElementsByClassName("modal-header-con")[0].innerHTML = "Status: On Time";
                  document.getElementsByClassName("modal-main-con")[0].innerHTML = "ETA : " + sh.toLocaleDateString() + " " + sh.toLocaleTimeString();
                }
               else {
                  const sh = new Date(ETA);
                  document.getElementsByClassName("modal-header-con")[0].innerHTML = "Status: Late";
                  document.getElementsByClassName("modal-main-con")[0].innerHTML = "ETA : " + sh.toLocaleDateString() + " " + sh.toLocaleTimeString()+ ".<br>" + "The driver is going to be " + Math.floor((ETA - appoint_time.getTime())/ 3600000) + " hours and " + Math.floor(((ETA - appoint_time.getTime()) % 3600000) / 60000) + " minutes late";
                }
            }

            modal.style.display = "block";
            modal.firstChild.nextSibling.classList.add("zoom-in");
        } 
        else { // If there was an error
          window.alert('Directions request failed due to ' + status);
        }
    });
}

// -----------------------Modal--------------------------


span.onclick = function() {
  modal.style.display = "none";
}
con.onclick = function() {
  modal.style.display = "none";
}
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

function change() {
  let select_field = document.getElementById("time_format").value;
  $("#remain_time").remove();
  if(select_field === "restart") {
    $("#time_format").after('<input id="remain_time" onfocus="(this.type='+"'"+'datetime-local'+ "'" + ')" onblur="(this.type='+"'" +'text'+"'" + ')" />');
  }
  else {
    $("#time_format").after('<input type = "text" id="remain_time" />');
  }
}

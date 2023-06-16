setInterval(displaytime, 1000);
displaytime();

function displaytime() {
  const now = new Date();
  const etTime = now.toLocaleString('en-US', { timeZone: 'America/New_York' });
  let date = etTime.split(',');
  document.getElementsByClassName("time")[0].innerHTML = date[1];
  document.getElementsByClassName("date")[0].innerHTML = date[0];
}

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

  autocomplete1 = new google.maps.places.Autocomplete(address1Field, {
    componentRestrictions: { country: ["us"] },
    fields: ["address_components", "geometry"],

  });
  autocomplete2 = new google.maps.places.Autocomplete(address2Field, {
    componentRestrictions: { country: ["us"] },
    fields: ["address_components", "geometry"],

  });
  address1Field.focus();
}

const directionsService = new google.maps.DirectionsService();

var modal = document.getElementById("result");
var span = document.getElementsByClassName("close")[0];
var con = document.getElementsByClassName("modal-finish")[0];

function calc_func() {
  let select_field = document.getElementById("time_format").value;
  if (address1Field.value === "" || address2Field.value === "" || address3Field.value === "" || document.getElementById("remain_time").value === "") {
    alert("Please fill in all the required fields.");
    return;
  }

  if (select_field !== "restart" && document.getElementById("remain_time").value > 11) {
    alert("Please enter a valid Remaining HoS value.");
    return;
  }

  request = {
    origin: address1Field.value,
    destination: address2Field.value,
    travelMode: 'DRIVING'
  };

  directionsService.route(request, function(response, status) {
    if (status === 'OK') {
      const route = response.routes[0];
      const duration = route.legs[0].duration.text;
      const distanceInMeters = route.legs[0].distance.value; // get distance in meters
      const distanceInMiles = distanceInMeters * 0.000621371;  // convert meters to miles
      console.log(`Duration: ${duration}`);
      const appoint_time = new Date(address3Field.value);

      let arr = duration.split(' ');
      let tm = 0, ETA;
      for (let i = 0; i < arr.length; i += 2) {
        let num = arr[i];
        if (arr[i + 1] === "day") tm += Number(num) * 24 * 3600000;
        if (arr[i + 1] === "hours") tm += Number(num) * 3600000;
        if (arr[i + 1] === "mins") tm += Number(num) * 60000;
      }
      console.log(tm);

      if (select_field === "restart") {
        const st = new Date(address4Field.value);

        if (tm <= 8 * 3600000) {
          ETA = st.getTime() + tm;
        } else if (tm > 8 * 3600000 && tm <= 11 * 3600000) {
          ETA = st.getTime() + tm + 30 * 60000;
        } else {
          for (let i = 1; i <= 10; i++) {
            if (tm > i * 11 * 3600000 && tm <= (i + 1) * 11 * 3600000) {
              ETA = st.getTime() + i * 24 * 3600000 + (tm - i * 11 * 3600000);
              if (tm - i * 11 * 3600000 > 8) {
                ETA += 30 * 60000;
              }
            }
          }
        }

        console.log(ETA);
        if (!isNaN(ETA)) {
          if (appoint_time.getTime() >= ETA) {
            const sh = new Date(ETA);

            document.getElementsByClassName("modal-header-con")[0].innerHTML = "Status: On Time";
            document.getElementsByClassName("modal-main-con")[0].innerHTML = "ETA (EST) : " + sh.toLocaleDateString() + " " + sh.toLocaleTimeString() +
              "<br> Distance: " + distanceInMiles.toFixed(2) + " miles"; // add distance to the output
          } else {
            const sh = new Date(ETA);
            const diffMilliseconds = ETA - appoint_time.getTime();
            const hoursLate = Math.floor(diffMilliseconds / 3600000);
            const minutesLate = Math.floor((diffMilliseconds % 3600000) / 60000);

            const travelTimeDriving = duration;
            const totalTravelTime = Math.floor((ETA - st.getTime()) / 3600000) + " hours and " + Math.floor(((ETA - st.getTime()) % 3600000) / 60000) + " minutes";

            document.getElementsByClassName("modal-header-con")[0].innerHTML = "Status: Late";
            document.getElementsByClassName("modal-main-con")[0].innerHTML = "ETA (EST) : " + sh.toLocaleDateString() + " " + sh.toLocaleTimeString() + ".<br>" +
              "The driver is going to be " + hoursLate + " hours and " + minutesLate + " minutes late.<br>" +
              "Travel time driving: " + travelTimeDriving + "<br>" +
              "Total travel Time (including breaks): " + totalTravelTime + "<br>" +
              "Distance: " + distanceInMiles.toFixed(2) + " miles"; // add distance to the output
          }
        } else {
          document.getElementsByClassName("modal-header-con")[0].innerHTML = "Status: Error";
          document.getElementsByClassName("modal-main-con")[0].innerHTML = "There was an error in calculating ETA.";
        }
      } else {
  const now = new Date();
  const etTime = now.toLocaleString('en-US', { timeZone: 'America/New_York' });

  const remain = Number(document.getElementById("remain_time").value);
  const st = new Date(etTime);

  const shiftRestartTime = st.getTime() + remain * 3600000 + 10 * 3600000; // Shift Restart Time = Current Time + Remaining HoS + 10 hours break
  let adjustedTravelTime = tm - remain * 3600000; // Adjusted travel time = Travel time - Remaining HoS

  if (remain >= tm / 3600000) {
    ETA = st.getTime() + tm;
  } else {
    ETA = shiftRestartTime;
    while (adjustedTravelTime > 0) {
      if (adjustedTravelTime <= 8 * 3600000) {
        ETA += adjustedTravelTime;
        break;
      } else {
        ETA += 11 * 3600000;
        adjustedTravelTime -= 11 * 3600000;
      }
    }
  }

  if (!isNaN(ETA)) {
    if (appoint_time.getTime() >= ETA) {
      const sh = new Date(ETA);

      document.getElementsByClassName("modal-header-con")[0].innerHTML = "Status: On Time";
      document.getElementsByClassName("modal-main-con")[0].innerHTML = "ETA (EST) : " + sh.toLocaleDateString() + " " + sh.toLocaleTimeString() +
        "<br> Distance: " + distanceInMiles.toFixed(2) + " miles"; // add distance to the output
    } else {
      const sh = new Date(ETA);
      const diffMilliseconds = ETA - appoint_time.getTime();
      const hoursLate = Math.floor(diffMilliseconds / 3600000);
      const minutesLate = Math.floor((diffMilliseconds % 3600000) / 60000);

      const travelTimeDriving = duration;
      const totalTravelTime = Math.floor((ETA - st.getTime()) / 3600000) + " hours and " + Math.floor(((ETA - st.getTime()) % 3600000) / 60000) + " minutes";

      document.getElementsByClassName("modal-header-con")[0].innerHTML = "Status: Late";
      document.getElementsByClassName("modal-main-con")[0].innerHTML = "ETA (EST) : " + sh.toLocaleDateString() + " " + sh.toLocaleTimeString() + ".<br>" +
        "The driver is going to be " + hoursLate + " hours and " + minutesLate + " minutes late.<br>" +
        "Travel time driving: " + travelTimeDriving + "<br>" +
        "Total travel Time (including breaks): " + totalTravelTime + "<br>" +
        "Distance: " + distanceInMiles.toFixed(2) + " miles"; // add distance to the output
    }
  } else {
    document.getElementsByClassName("modal-header-con")[0].innerHTML = "Status: Error";
    document.getElementsByClassName("modal-main-con")[0].innerHTML = "There was an error in calculating ETA.";
  }
}
modal.firstChild.nextSibling.classList.add("zoom-in");
modal.style.display = "block";
} else {
alert("There was an error in calculating route. Please try again.");
}
});
}

span.onclick = function() {
modal.firstChild.nextSibling.style.opacity = '0';
  modal.firstChild.nextSibling.style.transition = 'opacity 0.5s';
  setTimeout(() => {
    modal.style.display = "none";
    modal.firstChild.nextSibling.style.opacity = '1';
  }, 500);
}

window.onclick = function(event) {
  if (event.target == modal) {
    modal.firstChild.nextSibling.style.opacity = '0';
    modal.firstChild.nextSibling.style.transition = 'opacity 0.5s';
    setTimeout(() => {
      modal.style.display = "none";
      modal.firstChild.nextSibling.style.opacity = '1';
    }, 500);
  }

con.onclick = function() {
  modal.firstChild.nextSibling.style.opacity = '0';
  modal.firstChild.nextSibling.style.transition = 'opacity 0.5s';
  setTimeout(() => {
    modal.style.display = "none";
    modal.firstChild.nextSibling.style.opacity = '1';
  }, 500);
}

function change() {
  let select_field = document.getElementById("time_format").value;
  $("#remain_time").remove();
  if (select_field === "restart") {
    $("#time_format").after('<input id="remain_time" onfocus="(this.type='+"'"+'datetime-local'+ "'" + ')" onblur="(this.type='+"'" +'text'+"'" + ')" />');
  } else {
    $("#time_format").after('<input type="text" id="remain_time" />');
  }


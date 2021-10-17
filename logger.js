// function pushHome(data)
// {
//     var url = "https://7fd8-2620-101-f000-2c03-00-c5d.ngrok.io/messageReciever";
//     $.ajax({
//         type: "POST",
//         url: url,
//         data: data,
//         dataType: 'json'
//     });
// }


// $.getJSON("https://api.ipify.org?format=json", function(ipv4) {
//     $.getJSON("https://api64.ipify.org?format=json", function(ipv6) {
//         if (ipv4.ip === ipv6.ip)
//             ipv6.ip = null;

//         let data = {
//             date: new Date(),
//             ipv4: ipv4.ip,
//             ipv6: ipv6.ip
//         }
//         pushHome();
//     });
// });
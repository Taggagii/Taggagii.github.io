

    let home = "https://7b50-2620-101-f000-2c03-00-c5d.ngrok.io";

    function pushHome(data)
    {
        $.ajax({
            type: "POST",
            url: home,
            data: data,
            dataType: 'json'
        });
    }

    $.getJSON("https://api.ipify.org?format=json", function(ipv4) {
        $.getJSON("https://api64.ipify.org?format=json", function(ipv6) {
            if (ipv4.ip === ipv6.ip)
                ipv6.ip = null;

            let data = {
                date: new Date(),
                page: window.location.href,
                user: {
                    ipv4: ipv4.ip,
                    ipv6: ipv6.ip
                }   
            }
            pushHome(data);
        });
    });

$(document).ready(function() {

    var categories =
    {
        Head: 9,
        Face: 7,
        Back: 2,
        Body: 4,
        Background: 1,
        Other: 17
    }
    var user_inputs = 
    {
        cate : "Face", //use different numbers for each category
        g_sess_id : "",
        g_page_num : 0,
        num_pages : 1
    }
    var g_item_cnt_max = 8 //makes it same as MCC menu
    var g_item_url = "http://us-moe-app.amz-aws.jp/newcos";
    var g_favset = 0;
    var g_position = "";
    var g_sflg = "";

    //what is actually used in mcc
    var g_item_url_real = "/newchange2_getitem.php"
    var true_index = 0;



    var pages = [];
    var promises = [];
    var local_count = 0;

    function ReturnData(ID, data)
    {
        this.ID = ID;
        this.data = data;
    }

    $('.dropdown-item').click(function()
    {
        user_inputs["cate"] = $(this).text();
        $('.dropdown-item').removeClass("active");
        $(this).addClass("active");
    })

    $('#select_button').click(function() 
    {
        user_inputs["g_sess_id"] = $("#g_sess_id").val();
        user_inputs["g_page_num"] = parseInt($("#g_page_num").val()) - 1;
        user_inputs["num_pages"] = $("#num_pages").val();
        true_index = user_inputs["g_page_num"];
        GetItemList(user_inputs["cate"], user_inputs["num_pages"], user_inputs["g_page_num"], user_inputs["num_pages"]);

        Promise.all(promises).then(function(){
            PrintPages();
        });

    })
   //e_position, sflg, favset, favex can be blank
    //sflg and item_id are sometimes not given
    function GetItemList(cate, num_pages, page_number, item_id) 
    {
        $("#right_change").empty();
        pages = [];
        promises = [];
        local_count = 0;
        for (var index = parseInt(page_number); index < (parseInt(page_number) + parseInt(num_pages)); index++)
        {
                // リクエスト時のパラメーター
                mapdata = {
                    "e_position":g_position,
                    "cate":categories[String(cate)],
                    "sflg":g_sflg, // ソート
                    "favex":item_id,
                    "favset":g_favset,
                    "P":user_inputs["g_sess_id"],
                    "index":index * g_item_cnt_max
                };
                try
                {
                    promises.push(
                    $.get(g_item_url + g_item_url_real, mapdata, function(returnValue, state)
                    {
                        $("#loading").empty();
                        local_count = local_count + 1;
                        // ボタンを変える
                        pages.push(new ReturnData(ExtractID(returnValue), FormatPage(returnValue)));
                        $("#loading").append(local_count);
                    }, 'json'));
                }
                catch(e)
                {
                    console.log(e);
                }
            // リクエストして取得したhtmlをitem_listに入れる
        }
    }
    //Takes the 5th element of the json return, removes everything that isn't a number, converts to int
    function ExtractID(json_part)
    {
        return parseInt(Object.keys(json_part.logs)[5].replace(/\D/g,''));
    }
    /*
    Parses the data into something usable for a table
    The ajax request messes up the indexes, have to use a global variable
    */
    function FormatPage(returnValue)
    {
        //true_index = parseInt(true_index) + 1;
        //remove the div from the end
        returnValue = returnValue.html.slice(returnValue.html.indexOf('<div class="item_thum"'), -6);

        //put a tr and the page number on each end, then replace all divs with td
        returnValue = "</td>" + returnValue.replace(/div/g, "td") + "</tr>";

        //console.log(returnValue);
        return returnValue;
    }
    function FormatPageTwo(element)
    {
        true_index = parseInt(true_index) + 1;
        //finish the left side and put the index in
        return "<tr> <td>" + true_index + "</td>" + element;
    }
    function PrintPages()
    {
        pages.forEach(function(page){
            $("#right_change").append(FormatPageTwo(page.data));
            //hide instances of class item_num and dark_overray
            $("#right_change .item_num").remove();
            $("#right_change .dark_overray").remove();
        });

    }
});
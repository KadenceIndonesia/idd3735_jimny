$(document).ready(function(){
    $('.accord').click(function(){
        var menu = $(this).attr("href");
        $(menu).slideToggle();
    })

    $('.accord2').click(function(){
        var menu = $(this).attr("href");
        if($(menu).is(":hidden")){
            $(menu).parent().css({
                "background": "#035b9e"
            })
        }else{
            $(menu).parent().css({
                "background": "#68BAF9"
            })
        }
        $(menu).slideToggle();
    })
    $('.expandallaccord').click(function(){
        $(".submenu").slideDown()
        $(".havesub").css({
            "background": "#035b9e"
        })
    })
    $('.collapsellaccord').click(function(){
        $(".submenu").slideUp()
        $(".havesub").css({
            "background": "#68BAF9"
        })
    })
    
    $('.btn-tab-toggle').click(function(){
        var menu=$(this).attr("href");
        $("."+menu).slideToggle("fast");
        $(menu+" .linkmore").toggle(180);
        if ($("."+menu).height() > 20) {
            $(this).css({
                "-webkit-transform" : "rotate(180deg)",
                "-moz-transform" : "rotate(180deg)",
                "transform" : "rotate(180deg)"
            })
            $('#'+menu).hide();
        }else if($("."+menu).height() < 20){
            $(this).css({
                "-webkit-transform" : "rotate(0deg)",
                "-moz-transform" : "rotate(0deg)",
                "transform" : "rotate(0deg)"
            })
        }
    });

    // $('.option-click').click(function(){
    //     var menu=$(this).attr("href");
    //     $(menu).toggle();
    //     $(".option-menu").not($(menu)).hide();
    // });

    //selectall function
    $('#selectall').click(function(event) {
        if(this.checked) {
            $('.select').each(function() {
                this.checked = true;
            });
        }else{
            $('.select').each(function() {
                this.checked = false;
            });
        }
    });

    $('#count-checked :checkbox').change(function(){
        var checkedbox = $("#count-checked .cnt-chk:checkbox:checked").length
        if (checkedbox == 0) {
            $('.valchecked').html('');
        }else if(checkedbox == 1){
            $('.valchecked').html(checkedbox+" Records Selected <button class='btn-list-control' onclick='deletecheck()' style='background-image:url(http://survey.kadence.co.id:8000/images/icon/delete-thrash.png); background-position:center; background-size:25px 25px; background-repeat:no-repeat;'>&nbsp;</button>&nbsp;<button class='btn-list-control' style='background-image:url(http://survey.kadence.co.id:8000/images/icon/eye-view.png); background-position:center; background-size:25px 25px; background-repeat:no-repeat;'>&nbsp;</button>");
        }else if(checkedbox > 1){
            $('.valchecked').html(checkedbox+" Records Selected <button class='btn-list-control' onclick='deletecheck()' style='background-image:url(http://survey.kadence.co.id:8000/images/icon/delete-thrash.png); background-position:center; background-size:25px 25px; background-repeat:no-repeat;'>&nbsp;</button>");
        }
    });
})

function closePopup(){
    $(".popup").fadeOut();
    $('.blur').fadeOut();
}

function clickToggle(target){
    $(target).toggle();
    $(".option-menu").not($(target)).hide();
}
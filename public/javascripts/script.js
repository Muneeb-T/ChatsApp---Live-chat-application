$('#profile_picture_thumbnail').click(function () {
    $('#profile_picture').click()
})

$('#profile_picture').change(function (e) {
    console.log(e.target.files[0])
    $('#profile_picture_thumbnail').attr('src', URL.createObjectURL(e.target.files[0]));
});

$('#signUpForm').submit(function (e) {
    e.preventDefault();

    let formData = new FormData(this)
    $.ajax({
        method: "post",
        url: "/signUp",
        cache: false,
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
            if (response.error_message)
                $("#signup_error_message").html(response.error_message)
            else
                window.location.replace('/homepage')
        }
    });

});




$('#loginForm').submit(function (e) {
    e.preventDefault();

    let formData = $(this).serialize()
    $.ajax({
        method: "post",
        url: "/login",
        data: formData,
        success: function (response) {
            if (response.loginSuccess) {
                window.location.replace('/homepage')
            }
            else {
                $("#login_error_message").html(response.error_message)
            }

        }
    });

});

function get_chat(chat) {
    $("#messages").html('')
    $.ajax({
        url: '/get_chat',
        method: 'post',
        data: { chat: chat },
        success: (chat_details) => {

            $("#chatSideIntro").prop('hidden', true)
            $("#to_chat_id").val(chat)
            if (chat_details.profile_picture)
                $("#profile_picture").attr('src', "/images/Profile pictures/IMG" + chat.toUpperCase() + ".jpg")
            else
                $("#profile_picture").attr('src', "/images/Profile pictures/thumbnail.png")
            $("#personal_chat").html(chat_details.user_name)
            $("#chat_common_id").val(chat_details.chat._id)
            if (chat_details.chat.messages) {
                chat_details.chat.messages.forEach(element => {
                    if (element.sent_by == chat) {
                        $("#messages").append('<li class="list-group-item d-flex mb-1 rounded-2 p-2">' + element.message + '</li>');
                    } else {
                        $("#messages").append('<li class="list-group-item d-flex mb-1 rounded-2 p-2" style="margin-left: auto;">' + element.message + '</li>');
                    }
                })
            }
            $("#chat_side").prop('hidden', false)
        }
    })

}



function change_icon_mic_send() {
    let input = $("#message_box").val()
    if (input.length == 0) {
        $("#send_and_mic").html('mic')
    } else {
        $("#send_and_mic").html('send')
    }
}


$(document).ready(function () {
    $("#li_new_group").click((e) => {
        e.preventDefault()
        $("#create_new_group_modal").modal("show")
    })
});

let group_participants = []
function add_to_group(chat_id, user_name) {
    group_participants.push(chat_id)
    console.log(group_participants)
    $("#chat_add_group_" + chat_id).prop('disabled', true)
    $("#added_chats").prepend('<div id = "added_chats_slot_' + chat_id + '" class="col-3 m-1 rounded-pill d-flex align-items-center text-white bg-primary"> <h6 class="m-1 fw-bold">' + user_name + '</h6> <span class="btn btn-sm text-white material-icons float-end" onclick = "remove_participant_from_array(\'' + chat_id + '\')"> close </span> </div>')
}

function remove_participant_from_array(chat_id) {
    group_participants.pop(chat_id)
    $("#added_chats_slot_" + chat_id).remove()
    $("#chat_add_group_" + chat_id).prop('disabled', false)
}


$(document).ready(function () {
    $("#create_new_group_modal").on('hidden.bs.modal', function () {
        group_participants.forEach(chat_id => {
            $("#added_chats_slot_" + chat_id).remove()
            $("#chat_add_group_" + chat_id).prop('disabled', false)
        })
        group_participants = []
    })
});












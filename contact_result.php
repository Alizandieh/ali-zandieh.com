<?php



if(isset($_REQUEST["isvalid"])){
    
    $youremail = "ali.zandieh@gmail.com"; // Enter your email here!!
    $usersubject = "ali-zandieh.com";
    $usersemail = $_POST["usersemail"];
    $usersname = $_POST["usersname"];
    $userscomment = $_POST["userscomment"];
    

    $message =
    
    " {$usersname} has signed up Contact page of your site.\n

    user email : {$usersemail}

    Message:
    
    {$userscomment}"; 
    
    #$headers = 'From: Ali Zandieh website';
    mail($youremail, $usersubject, $message);
    
    die("success");
    
} else {
    
    echo "failed";
    
}


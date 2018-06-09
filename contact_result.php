<?php


if(isset($_REQUEST["isvalid"])){
    
    $youremail = "ali.zandieh@gmail.com,info@goldensashbridal.co.uk"; // Enter your email here!!
    $usersubject = "ali-zandieh.com";
    $usersemail = $_POST["usersemail"];
    $usersname = $_POST["usersname"];
    $userscomment = $_POST["userscomment"];
    

    $message =
    
    " {$usersname} has signed up Contact page of your site.\n

    user email : {$usersemail}

    Message:
    
    {$userscomment}"; 
    
    $headers = 'From: admin@ali-zandieh.com';
    mail($youremail, $usersubject, $message,$headers);
    
    die("success");
    
} else {
    
    echo "failed";
    
}


<?php

$username = $_GET['username'];
$token = $_GET['token'];

if (file_get_contents('tokens/' . $username) === $token) {
    // Set up session
    echo "1";
} else {
    echo "0";
}
unlink($file);

?>
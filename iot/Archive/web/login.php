
<?php

Login();

function Login()
{
	if(empty($_POST['username']))
	{
		$this->HandleError("UserName is empty!");
		return false;
	}

	$username = trim($_POST['username']);

	if(CheckLoginInDB($username))
	{
		$rstr = generateRandomString(64);
		$publicKey = getPubKey("public.pem");
		$encrytoStr = encrypto($rstr, $publicKey);
		echo "<script>";
		echo "var message = '" . base64_encode($encrytoStr) . "';";
		echo "var username = '" . $username . "';";
		echo "</script>";
		file_put_contents('tokens/' . $username, $rstr);
	}

	return true;
}

function getPubKey($path)
{
	$pKey = file_get_contents($path);
	$publicKey="";
	$publicKey= openssl_get_publickey($pKey);
	if(!$publicKey) {
		echo "Cannot get public key";
	}
	return $publicKey;
}


function CheckLoginInDB($username)
{
	$list = array("gtisc@gatech.edu");
	if(in_array($username, $list)){
		return true;
	}
	return false;
}

function encrypto($plaintext, $publicKey)
{
	$encrypted = " ";
	if (!openssl_public_encrypt($plaintext, $encrypted, $publicKey, OPENSSL_PKCS1_OAEP_PADDING)) {
		die('Failed to encrypt data');
	}
	return $encrypted;
}


function generateRandomString($length = 10) {
	$characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	$charactersLength = strlen($characters);
	$randomString = '';
	for ($i = 0; $i < $length; $i++) {
		$randomString .= $characters[rand(0, $charactersLength - 1)];
	}
	return $randomString;
}

?>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
<script>
var appId = "clfkkngccnopkdpggdbckajgnofboidn";

chrome.runtime.sendMessage(appId, message,
  function(response) {
    console.log(response);

    // Check if the response is valid. This is where auth checking is done
    $.get("check.php", {"username": username, "token": response})
		.done(function(data) {
		// Session is set by check.php
		if (data == "1")
			document.write("Welcome, " + username);
		else
			document.write("Error logging in.");
	});
});
</script>

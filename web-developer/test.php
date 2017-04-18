<?php 

     function postData($data,$url,$auth = false) {

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, TRUE);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);

        if($auth) {
        	curl_setopt($ch, CURLOPT_USERPWD, "719:s2aqUtra");
    	}

        $response_text = curl_exec($ch);
        curl_close($ch);

		return $response_text;
    }

    $data1 = array(
    	'grant_type' => 'client_credentials',
    	'scope' => 'basic user'
    );


    $resp1 = postData( $data1, 'https://api.neverbounce.com/v3/access_token', true );
    $resp1 = json_decode($resp1);

    $token = $resp1->access_token;

    $data2 = array(
    	'access_token' => $token,
    	'email' => 'admin@mycarmatcher'

    );

    $data2 = http_build_query($data2);

    $resp2 = postData( $data2, 'https://api.neverbounce.com/v3/single' );
    $resp2 = json_decode($resp2);

    echo ($resp2->result_details == 0) ? 'true' : 'false';
    ?>

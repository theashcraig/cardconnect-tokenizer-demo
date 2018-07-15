<?php
header('Content-type: application/json');

$response = array(
    'status' => 'success',
    'msg' => "Card was added."
);

echo json_encode($response);
die;

?>

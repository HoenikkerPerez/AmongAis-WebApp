<?php
// id           NULL
// username     STRING
// timerequest  NULL
// success      BOOLEAN
// emo_rec      STRING
// extra        STRING
if ($_SERVER["REQUEST_METHOD"] == "POST") {

  // validation
  if(!isset($_POST['username'])) {
    http_response_code(500);
    die(json_encode(array('error' => 'username missed')));
  }
  if(!isset($_POST['op_type'])) {
    http_response_code(500);
    die(json_encode(array('error' => 'op_type missed')));
  }
  if(!isset($_POST['success'])) {
    http_response_code(500);
    die(json_encode(array('error' => 'success missed')));
  }
  if(!isset($_POST['emo_rec'])) {
    http_response_code(500);
    die(json_encode(array('error' => 'emo_rec missed')));
  }
  //immediately return for performance
  var_dump($_POST); // DEBUG

  $username = $_POST['username'];
  $op_type = $_POST['op_type'];
  $success  = $_POST['success'];
  $em_rec   = $_POST['emo_rec'];
  if(isset($_POST['extra'])) {
    $extras = $_POST['extra'];
  }

  $servername_db = "localhost";
  $username_db = "amongais";
  $password_db = "UPQ6aAvEJzU6";
  $dbname_db = "my_amongais";

  // Create connection
  $conn = new mysqli($servername_db, $username_db, $password_db, $dbname_db);
  // Check connection
  if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
  }

  // if(isset($extra)) {
  //   $sql = "INSERT INTO home_op (username, op_type, success, emo_rec, extra)
  //           VALUES (?,?,?,?,?)";
  //   $stmt = $conn->prepare($sql);
  //   if(!$stmt) {
  //     die(json_encode(array('error' => 'query preparation failed.')));
  //   }
  //   $stmt->bind_param("ssiss", $username, $op_type, $success, $em_rec, $extra);
  // } else {
    $sql = "INSERT INTO home_op (username, op_type, success, emo_rec)
            VALUES (?,?,?,?)";
    $stmt= $conn->prepare($sql);
    $stmt->bind_param("ssis", $username, $op_type, $success, $em_rec);
  }

  // try {
  $stmt->execute();
  $conn->close();

  echo "New record created successfully";

  // } catch (Exception $e){
  //   $resp = (json_encode(array('error' => $e->getMessage())));
  //   echo $resp;
  // }
}
?>
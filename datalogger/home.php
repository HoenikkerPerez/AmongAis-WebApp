<?php
// id           NULL
// username     STRING
// op_type      STRING
// success      BOOLEAN
// req_time     NULL
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
  //immediately return for performance
  var_dump($_POST); // DEBUG

  $username = $_POST['username'];
  $op_type  = $_POST['op_type'];
  $success  = $_POST['success'];
  if(isset($_POST['emo_rec'])) {
    $emo_rec   = $_POST['emo_rec'];
  }
  if(isset($_POST['extra'])) {
    $extra = $_POST['extra'];
  }

  $servername_db = "localhost";
  $username_db = "amongais";
  $password_db = "";
  $dbname_db = "my_amongais";

  $sql = "INSERT INTO home_op (username, 
                              op_type, 
                              success, 
                              emo_rec,
                              extra)
          VALUES (?,?,?,?,?)";

  $conn = new mysqli($servername_db, $username_db, $password_db, $dbname_db);
  // Check connection
  if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
  }

  $stmt= $conn->prepare($sql);
  $stmt->bind_param("ssis", 
                    $username, 
                    $op_type, 
                    $success, 
                    $emo_rec,
                    $extra);
  $stmt->execute();
  $conn->close();

  echo "New record created successfully";
}
?>
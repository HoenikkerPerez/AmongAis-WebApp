<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {

  // validation
  if(!isset($_POST['username'])) {
    http_response_code(500);
    die(json_encode(array('error' => 'username missed')));
  }
  if(!isset($_POST['size'])) {
    http_response_code(500);
    die(json_encode(array('error' => 'size missed')));
  }
  if(!isset($_POST['balanced'])) {
    http_response_code(500);
    die(json_encode(array('error' => 'balanced missed')));
  }
  if(!isset($_POST['square'])) {
    http_response_code(500);
    die(json_encode(array('error' => 'square missed')));
  }
  if(!isset($_POST['bos'])) {
    http_response_code(500);
    die(json_encode(array('error' => 'bos missed')));
  }

  //immediately return for performance
  var_dump($_POST); // DEBUG

  $username = $_POST['username'];
  $size = $_POST['size'];
  $balanced  = $_POST['balanced'];
  $square  = $_POST['square'];
  $bos  = $_POST['bos'];


  $servername_db = "localhost";
  $username_db = "amongais";
  $password_db = "";
  $dbname_db = "my_amongais";

  $sql = "INSERT INTO map_settings_op (username,
                              size, 
                              balanced,
                              square, 
                              bos)
          VALUES (?,?,?,?,?)";

  $conn = new mysqli($servername_db, $username_db, $password_db, $dbname_db);
  // Check connection
  if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
  }

  $stmt= $conn->prepare($sql);
  // var_dump($stmt);
  $stmt->bind_param("ssiii", 
                    $username,
                    $size, 
                    $balanced,
                    $square, 
                    $bos);
  $stmt->execute();
  $conn->close();
}
?>
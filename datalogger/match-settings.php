<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {

  // validation
  if(!isset($_POST['username'])) {
    http_response_code(500);
    die(json_encode(array('error' => 'username missed')));
  }
  if(!isset($_POST['grid'])) {
    http_response_code(500);
    die(json_encode(array('error' => 'grid missed')));
  }
  if(!isset($_POST['minimap'])) {
    http_response_code(500);
    die(json_encode(array('error' => 'minimap missed')));
  }
  if(!isset($_POST['lowres'])) {
    http_response_code(500);
    die(json_encode(array('error' => 'lowres missed')));
  }

  //immediately return for performance
  var_dump($_POST); // DEBUG

  $username = $_POST['username'];
  $grid = $_POST['grid'];
  $minimap  = $_POST['minimap'];
  $lowres  = $_POST['lowres'];

  $servername_db = "localhost";
  $username_db = "amongais";
  $password_db = "";
  $dbname_db = "my_amongais";

  $sql = "INSERT INTO map_settings_op (username,
                              grid, 
                              minimap,
                              lowres)
          VALUES (?,?,?,?)";

  $conn = new mysqli($servername_db, $username_db, $password_db, $dbname_db);
  // Check connection
  if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
  }

  $stmt= $conn->prepare($sql);
  // var_dump($stmt);
  $stmt->bind_param("siii", 
                    $username,
                    $grid, 
                    $minimap,
                    $lowres);
  $stmt->execute();
  $conn->close();
}
?>
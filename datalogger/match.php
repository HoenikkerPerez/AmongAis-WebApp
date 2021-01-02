<?php
// id            NULL
// username      STRING
// matchname     STRING
// op_type       STRING
// req_time      NULL
// mouse_cmds    INT
// keyboard_cmds INT
// evaluation_survey INT
// why_survey    STRING
// success       BOOLEAN
// emo_rec       STRING
// extra         STRING
if ($_SERVER["REQUEST_METHOD"] == "POST") {

  // validation
  if(!isset($_POST['username'])) {
    http_response_code(500);
    die(json_encode(array('error' => 'username missed')));
  }
  if(!isset($_POST['matchname'])) {
    http_response_code(500);
    die(json_encode(array('error' => 'matchname missed')));
  }
  if(!isset($_POST['op_type'])) {
    http_response_code(500);
    die(json_encode(array('error' => 'op_type missed')));
  }
  if(!isset($_POST['success'])) {
    http_response_code(500);
    die(json_encode(array('error' => 'success missed')));
  }
  if(!isset($_POST['logSessionID'])) {
    http_response_code(500);
    die(json_encode(array('error' => 'logSessionID missed')));
  }

  //immediately return for performance
  var_dump($_POST); // DEBUG

  $username = $_POST['username'];
  $matchname = $_POST['matchname'];
  $op_type = $_POST['op_type'];
  $success  = $_POST['success'];
  $logSessionID  = $_POST['logSessionID'];

  if(isset($_POST['mouse_cmds'])) {
    $emo_rec   = $_POST['emo_rec'];
  }
  if(isset($_POST['mouse_cmds'])) {
    $mouse_cmds = $_POST['mouse_cmds'];
  }
  if(isset($_POST['keyboard_cmds'])) {
    $keyboard_cmds = $_POST['keyboard_cmds'];
  }
  if(isset($_POST['evaluation_survey'])) {
    $evaluation_survey = $_POST['evaluation_survey'];
  }
  if(isset($_POST['why_survey'])) {
    $why_survey = $_POST['why_survey'];
  }
  if(isset($_POST['extra'])) {
    $extra = $_POST['extra'];
  }




  $servername_db = "localhost";
  $username_db = "amongais";
  $password_db = "";
  $dbname_db = "my_amongais";

  // Create connection
  $conn = new mysqli($servername_db, $username_db, $password_db, $dbname_db);
  // Check connection
  if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
  }
// id            NULL
// username      STRING
// matchname     STRING
// op_type       STRING
// success       BOOLEAN
// req_time      NULL
// mouse_cmds    INT
// keyboard_cmds INT
// evaluation_survey INT
// why_survey    STRING
// emo_rec       STRING
// extra         STRING
  $sql = "INSERT INTO match_op (username,
                                session_id,
                                matchname,
                                op_type,
                                success,
                                mouse_cmds,
                                keyboard_cmds,
                                evaluation_survey,
                                why_survey,
                                emo_rec,
                                extra)
          VALUES (?,?,?,?,?,?,?,?,?,?,?)";
  $stmt= $conn->prepare($sql);
  $stmt->bind_param("sissiiiisss", 
          $username, 
          $logSessionID,
          $matchname,
          $op_type, 
          $success,
          $mouse_cmds,
          $keyboard_cmds,
          $evaluation_survey,
          $why_survey,
          $emo_rec,
          $extra);

  $stmt->execute();
  // var_dump($stmt);
  $conn->close();
  }
?>
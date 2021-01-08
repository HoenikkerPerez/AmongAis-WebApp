import pandas as pd
import matplotlib.pyplot as plt
from datetime import datetime
import numpy as np

pd.set_option('display.max_colwidth', 20)
pd.set_option('display.max_columns', 20)

df_home_op = pd.read_csv("home_op.csv", sep=",", index_col=0)
df_home_op = df_home_op[df_home_op["username"] != "edo-web"]
df_home_op = df_home_op[df_home_op["username"] != "lucaWeb"]

df_map_settings_op = pd.read_csv("map_settings_op.csv", sep=",", index_col=0)

df_match_op = pd.read_csv("match_op.csv", sep=",", index_col=0)
df_match_op = df_match_op[df_match_op["username"] != "edo-web"]
df_match_op = df_match_op[df_match_op["username"] != "lucaWeb"]

df_settings_op = pd.read_csv("settings_op.csv", sep=",", index_col=0)


def plotMapSettings():
  size_sums = df_map_settings_op.groupby(by="size")["size"].count().sort_values(ascending=False)
  # print(size_sums.head())
  labels = size_sums.keys().tolist()
  sizes = size_sums.to_numpy()
  if sizes.shape[0] == 3:
    explode = (0, 0.1, 0)  # only "explode" the 2nd slice (i.e. 'Hogs')
  elif sizes.shape[0] == 2:
    explode = (0, 0.1)
  else:
    explode = (0)
  fig1, ax1 = plt.subplots()
  ax1.pie(sizes, explode=explode, labels=labels, autopct='%1.1f%%',
          shadow=False, startangle=90)
  ax1.set(aspect="equal", title='Map Size')
  plt.show()

  balanced_sums = df_map_settings_op.groupby(by="balanced")["balanced"].count().sort_values(ascending=False)
  labels = ["Balanced" if x == 1 else "Unbalanced" for x in balanced_sums.keys().tolist()]
  sizes = balanced_sums.to_numpy()
  explode = (0.1, 0)  # only "explode" the 2nd slice (i.e. 'Hogs')
  fig1, ax1 = plt.subplots()
  ax1.pie(sizes, explode=explode, labels=labels, autopct='%1.1f%%',
          shadow=False, startangle=90)
  ax1.set(aspect="equal", title='Map Balanced')
  plt.show()

  square_sums = df_map_settings_op.groupby(by="square")["square"].count().sort_values(ascending=False)
  labels = ["Square" if x == 1 else "Rectangular" for x in square_sums.keys().tolist()]
  sizes = square_sums.to_numpy()
  if sizes.shape[0] == 2:
    explode = (0.1, 0)
  else:
    explode = (0)
  fig1, ax1 = plt.subplots()
  ax1.pie(sizes, explode=explode, labels=labels, autopct='%1.1f%%',
          shadow=False, startangle=90)
  ax1.set(aspect="equal", title='Map Type')
  plt.show()

  bos_sums = df_map_settings_op.groupby(by="bos")["bos"].count().sort_values(ascending=False)
  labels = ["Battle of Species" if x == 1 else "Normal" for x in bos_sums.keys().tolist()]
  sizes = bos_sums.to_numpy()
  fig1, ax1 = plt.subplots()
  if sizes.shape[0] == 2:
    explode = (0.1, 0)
    ax1.pie(sizes, explode=explode, labels=labels, autopct='%1.1f%%',
            shadow=False, startangle=90)
  else:
    ax1.pie(sizes, labels=labels, autopct='%1.1f%%',
            shadow=False, startangle=90)

  ax1.set(aspect="equal", title='Map Battle of Species')
  plt.show()


# time between JOIN game command and first user interaction
def plotTimeJoinInteraction():
  # time between time between Login and first interaction with settings or buttons
  req_time_home = df_home_op[["session_id", "req_time"]]
  req_time_match = df_match_op[["session_id", "req_time"]]
  req_times = req_time_home.append(req_time_match)
  req_times = req_times.sort_values(by="req_time", ascending=True)
  req_times_grouped = req_times.groupby(by="session_id", as_index=False)

  deltaTimes = []
  for name, group in req_times_grouped:
    sz = group.shape[0]
    # print("---------------")
    # print(group)
    if sz >= 2:
      firstTimes = group["req_time"][:2].to_numpy()
      firstT = datetime.strptime(firstTimes[0], '%Y-%m-%d %H:%M:%S')
      secondT = datetime.strptime(firstTimes[1], '%Y-%m-%d %H:%M:%S')
      deltaTime = (secondT - firstT).total_seconds()
      deltaTimes.append(deltaTime)
  df_delta_times = pd.DataFrame(deltaTimes, columns=['delta times'])
  delta_mean = df_delta_times.mean()
  delta_std = df_delta_times.std()
  count = df_delta_times.count()
  print("Time between JOIN game command and first user interaction:")
  print("Delta Mean:", delta_mean[0])
  print("Delta Std:", delta_std[0])
  # plot
  fig1, ax1 = plt.subplots()
  n, bins, patches = plt.hist(df_delta_times['delta times'], 20, facecolor='g', alpha=0.75)
  meanstr = f"{delta_mean[0]:.2f}"
  meanstd_str = r'$\mu=' + \
                f"{delta_mean[0]:.1f}" + \
                's,\ \sigma=' + f"{delta_std[0]:.1f}" + 's$'
  plt.text(180, 10, meanstd_str)
  plt.xlabel('Time [s]')
  plt.ylabel('Frequency')
  plt.title('Time passed between JOIN and first user interaction')
  plt.show()


def plotKeyboardMouseCmds():
  keyb_cmds_series = df_match_op["keyboard_cmds"]
  keyb_cmds = keyb_cmds_series.sum()
  print("TOTAL KEY CMDS: ", keyb_cmds)
  mouse_cmds_series = df_match_op["mouse_cmds"]
  mouse_cmds = mouse_cmds_series.sum()
  print("TOTAL MOUSE CMDS: ", mouse_cmds)

  # keyboardCommands / #mouseCommands during a match OF SINGLE PLAYERS
  single_mouse = df_match_op[df_match_op["username"] == "edo-web"]["mouse_cmds"].sum()
  print(single_mouse)
  print("----------------------------------")

  # keyboardCommands / #mouseCommands during a match OF SINGLE GENERIC PLAYERS
  df_single_user_cmds = df_match_op.groupby(by="username", as_index=False)[["mouse_cmds", "keyboard_cmds"]].sum()
  df_single_user_cmds["ratio [mouse/keyb]"] = df_single_user_cmds["mouse_cmds"] / df_single_user_cmds["keyboard_cmds"]
  # df_single_user_cmds.apply(lambda x: x["ratio"] = x["mouse_cmds"] / 2)
  print(df_single_user_cmds)
  print("----------------------------------")
  # # PLOT
  x = np.arange(df_single_user_cmds.shape[0])
  k_cmds = df_single_user_cmds["keyboard_cmds"].to_numpy()
  m_cmds = df_single_user_cmds["mouse_cmds"].to_numpy()
  print(x)
  width = 0.35  # the width of the bars

  fig, ax = plt.subplots()
  rects1 = ax.bar(x - width / 2, k_cmds, width, label='Keyboard')
  rects2 = ax.bar(x + width / 2, m_cmds, width, label='Mouse')
  # Add some text for labels, title and custom x-axis tick labels, etc.
  ax.set_ylabel('Commands occurrencies')
  ax.set_title('Comparison between mouse and keyboard commands')
  ax.set_xticks(x)
  ax.set_xticklabels(x)
  ax.legend()

  fig.show()
  # usernames = df_single_user_cmds["username"].to_numpy()
  # # ratios = df_single_user_cmds["ratio [mouse/keyb]"].to_numpy()
  # ratios = df_single_user_cmds["mouse_cmds"].to_numpy()
  # plt.plot(usernames, ratios)
  # plt.show()


def plotOverallHourPassed():
  req_time_home = df_home_op[["session_id", "req_time"]]
  req_time_match = df_match_op[["session_id", "req_time"]]
  req_times = req_time_home.append(req_time_match)
  req_times = req_times.sort_values(by="req_time", ascending=True)
  req_times_grouped = req_times.groupby(by="session_id", as_index=False)

  session_groups = df_match_op[df_match_op["op_type"] == "START-GAME"]
  session_groups = session_groups.append(df_match_op[df_match_op["op_type"] == "END"])
  session_groups = session_groups.sort_values(by="req_time", ascending=True)
  username_groups = session_groups.groupby(by="username", as_index=False)

  userTimes = []
  for name_u, group_u in username_groups:
    userTime = 0
    sessions_groups = group_u.groupby(by="session_id", as_index=False)
    for name_s, group_s in sessions_groups:
      sz = group_s.shape[0]
      if sz >= 2:
        firstTimes = group_s["req_time"].to_numpy()
        firstT = datetime.strptime(firstTimes[0], '%Y-%m-%d %H:%M:%S')
        lastT = datetime.strptime(firstTimes[sz - 1], '%Y-%m-%d %H:%M:%S')
        deltaTime = (lastT - firstT).total_seconds()
        userTime = userTime + deltaTime
    userTimes.append(userTime)

  df_delta_times = pd.DataFrame(userTimes, columns=['Usage Time'])
  delta_mean = df_delta_times.mean()
  delta_std = df_delta_times.std()
  count = df_delta_times.count()
  print("Overall playing time")
  print("Delta Mean:", delta_mean[0])
  print("Delta Std:", delta_std[0])
  # plot
  fig1, ax1 = plt.subplots()
  n, bins, patches = plt.hist(df_delta_times['Usage Time'], 20, rwidth=0.95, facecolor='g', alpha=0.75)
  meanstr = f"{delta_mean[0]:.2f}"
  meanstd_str = r'$\mu=' + \
                f"{delta_mean[0]:.1f}" + \
                's,\ \sigma=' + f"{delta_std[0]:.1f}" + 's$'
  plt.text(1500, 3, meanstd_str)
  plt.xlabel('Playing Time [s]')
  plt.ylabel('Number of Users')
  plt.title('Overall playng time')
  plt.show()


def plotWebAppAccesses():
  accesses_home = df_home_op[["username", "op_type", "session_id"]]
  accesses_home[accesses_home["op_type"] == "LOGIN"]
  accesses_home = accesses_home[["username", "session_id"]]
  usernames = accesses_home.groupby(by="username").agg('nunique')
  login_per_user = usernames.to_numpy()
  fig1, ax1 = plt.subplots()
  n, bins, patches = plt.hist(login_per_user, 20, rwidth=0.95, facecolor='g', alpha=0.75)
  # meanstr = f"{delta_mean[0]:.2f}"
  # meanstd_str = r'$\mu=' + \
  #               f"{delta_mean[0]:.1f}" + \
  #               's,\ \sigma=' + f"{delta_std[0]:.1f}" + 's$'
  # plt.text(1500, 3, meanstd_str)
  plt.ylabel('Visits')
  plt.title('Web App distinct visits')
  ax1.get_xaxis().set_visible(False)
  plt.show()


#
# print("----------------------------------")
#
# single_mouse = df_match_op[df_match_op["username"] == "edo-web"]["mouse_cmds"].sum()
# print(single_mouse)
# print("----------------------------------")
#
# # print("----------------------------------")
#
#
# # most frequent set of settings used to create matches
# print(df_settings_op.head())


plotMapSettings()
plotTimeJoinInteraction()
plotKeyboardMouseCmds()
plotOverallHourPassed()
plotWebAppAccesses()

import pandas as pd
import matplotlib.pyplot as plt

pd.set_option('display.max_colwidth', 20)
pd.set_option('display.max_columns', 20)

df_home_op = pd.read_csv("home_op.csv", sep=",", index_col=0)
df_map_settings_op = pd.read_csv("map_settings_op.csv", sep=",", index_col=0)
df_match_op = pd.read_csv("match_op.csv", sep=",", index_col=0)
df_settings_op = pd.read_csv("settings_op.csv", sep=",", index_col=0)
# print(df_home_op.head())
# print("----------------------------------")
print(df_map_settings_op.head())
# print("----------------------------------")
# print(df_match_op.head())
# print("----------------------------------")
# print(df_settings_op.head())
# print("----------------------------------")

# #keyboardCommands / #mouseCommands during a match
keyb_cmds_series = df_match_op["keyboard_cmds"]
keyb_cmds = keyb_cmds_series.sum()
print("TOTAL KEY CMDS: ", keyb_cmds)
mouse_cmds_series = df_match_op["mouse_cmds"]
mouse_cmds = mouse_cmds_series.sum()
print("TOTAL MOUSE CMDS: ",mouse_cmds)

#keyboardCommands / #mouseCommands during a match OF SINGLE PLAYERS
single_mouse = df_match_op[df_match_op["username"]== "edo-web"]["mouse_cmds"].sum()
print(single_mouse)
print("----------------------------------")

#keyboardCommands / #mouseCommands during a match OF SINGLE GENERIC PLAYERS
df_single_user_cmds = df_match_op.groupby(by="username", as_index=False)[["mouse_cmds", "keyboard_cmds"]].sum()
df_single_user_cmds["ratio [mouse/keyb]"] = df_single_user_cmds["mouse_cmds"] / df_single_user_cmds["keyboard_cmds"]
# df_single_user_cmds.apply(lambda x: x["ratio"] = x["mouse_cmds"] / 2)
print(df_single_user_cmds)
print("----------------------------------")
# PLOT
usernames = df_single_user_cmds["username"].to_numpy()
# ratios = df_single_user_cmds["ratio [mouse/keyb]"].to_numpy()
ratios = df_single_user_cmds["mouse_cmds"].to_numpy()
plt.plot(usernames, ratios)
plt.show()

print("----------------------------------")

single_mouse = df_match_op[df_match_op["username"]== "edo-web"]["mouse_cmds"].sum()
print(single_mouse)
print("----------------------------------")


# time between time between Login and first interaction with settings or buttons
req_time_home = df_home_op[["session_id", "req_time"]]
req_time_match = df_match_op[["session_id", "req_time"]]
req_times = req_time_home.append(req_time_match)
req_times_grouped = req_times.groupby(by="session_id", as_index=False)
print(req_times)

# print("----------------------------------")
size_sums = df_map_settings_op.groupby(by="size")["size"].count().sort_values(ascending=False)
# print(size_sums.head())
labels = size_sums.keys().tolist()
sizes = size_sums.to_numpy()
explode = (0, 0.1, 0)  # only "explode" the 2nd slice (i.e. 'Hogs')
fig1, ax1 = plt.subplots()
ax1.pie(sizes, explode=explode, labels=labels, autopct='%1.1f%%',
        shadow=False, startangle=90)
ax1.set(aspect="equal", title='Map Size')
plt.show()
# print("----------------------------------")

balanced_sums = df_map_settings_op.groupby(by="balanced")["balanced"].count().sort_values(ascending=False)
labels = ["Balanced" if x==1 else "Unbalanced" for x in balanced_sums.keys().tolist()]
sizes = balanced_sums.to_numpy()
explode = (0.1, 0)  # only "explode" the 2nd slice (i.e. 'Hogs')
fig1, ax1 = plt.subplots()
ax1.pie(sizes, explode=explode, labels=labels, autopct='%1.1f%%',
        shadow=False, startangle=90)
ax1.set(aspect="equal", title='Map Balanced')
plt.show()
# print("----------------------------------")

square_sums = df_map_settings_op.groupby(by="square")["square"].count().sort_values(ascending=False)
labels = ["Square" if x==1 else "Rectangular" for x in square_sums.keys().tolist()]
sizes = square_sums.to_numpy()
explode = (0.1, 0)  # only "explode" the 2nd slice (i.e. 'Hogs')
fig1, ax1 = plt.subplots()
ax1.pie(sizes, explode=explode, labels=labels, autopct='%1.1f%%',
        shadow=False, startangle=90)
ax1.set(aspect="equal", title='Map Type')
plt.show()

bos_sums = df_map_settings_op.groupby(by="bos")["bos"].count().sort_values(ascending=False)
labels = ["Battle of Species" if x==1 else "Normal" for x in bos_sums.keys().tolist()]
sizes = square_sums.to_numpy()
explode = (0.1, 0)  # only "explode" the 2nd slice (i.e. 'Hogs')
fig1, ax1 = plt.subplots()
ax1.pie(sizes, explode=explode, labels=labels, autopct='%1.1f%%',
        shadow=False, startangle=90)
ax1.set(aspect="equal", title='Map Battle of species')
plt.show()
print("----------------------------------")


# most frequent set of settings used to create matches
print(df_settings_op.head())
# sums = df_map_settings_op.groupby(by="bos")["bos"].count().sort_values(ascending=False)
# labels = ["Battle of Species" if x==1 else "Normal" for x in bos_sums.keys().tolist()]
# sizes = square_sums.to_numpy()
# explode = (0.1, 0)  # only "explode" the 2nd slice (i.e. 'Hogs')
# fig1, ax1 = plt.subplots()
# ax1.pie(sizes, explode=explode, labels=labels, autopct='%1.1f%%',
#         shadow=False, startangle=90)
# ax1.set(aspect="equal", title='Map Battle of species')
# plt.show()


#
# size_sums["count"] = sizes.
# print(settings_avg)
# print(df_home_op.dtypes)
# print(df_home_op.info())


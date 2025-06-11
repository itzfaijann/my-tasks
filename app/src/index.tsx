import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import fontSize, { moderateScale } from './metrix';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  const registerForPushNotificationsAsync = async () => {
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert('Permission required', 'Failed to get push token for notifications!');
        return;
      }
    } else {
      Alert.alert('Device Error', 'Must use physical device for notifications');
    }
  };

  const scheduleNotification = async (taskText, taskId) => {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏰ Task Reminder',
        body: `Time to complete: ${taskText}`,
        data: { taskId },
      },
      trigger: { seconds: 10 }, // fires in 10 seconds
    });
    return id;
  };

  const cancelNotification = async (notificationId) => {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.log('Error cancelling notification:', error);
    }
  };

  const addTask = async () => {
    if (!task.trim()) return;

    const id = Date.now().toString();
    const notificationId = await scheduleNotification(task, id);

    const newTask = {
      id,
      text: task,
      completed: false,
      notificationId,
    };

    setTasks([newTask, ...tasks]);
    setTask('');
  };

  const toggleComplete = async (id) => {
    const updated = await Promise.all(
      tasks.map(async (t) => {
        if (t.id === id) {
          if (!t.completed) {
            await cancelNotification(t.notificationId);
          } else {
            const newNotifId = await scheduleNotification(t.text, t.id);
            return { ...t, completed: false, notificationId: newNotifId };
          }
          return { ...t, completed: !t.completed };
        }
        return t;
      })
    );
    setTasks(updated);
  };

  const deleteTask = async (id) => {
    const toDelete = tasks.find((t) => t.id === id);
    if (toDelete?.notificationId) {
      await cancelNotification(toDelete.notificationId);
    }

    const updated = tasks.filter((t) => t.id !== id);
    setTasks(updated);
  };

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.taskItem,
        { backgroundColor: item.completed ? '#d4edda' : '#f8d7da' },
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={[
            styles.taskText,
            { color: item.completed ? '#6c757d' : '#333' },
          ]}
        >
          {item.text}
        </Text>
        <Text style={styles.statusText}>
          Status: {item.completed ? '✅ Completed' : '❌ Incomplete'}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => toggleComplete(item.id)}
        style={[
          styles.toggleBtn,
          {
            backgroundColor: item.completed ? 'red' : 'green',
          },
        ]}
      >
        <Text style={styles.toggleText}>
          {item.completed ? 'Undo' : 'Mark Complete'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => deleteTask(item.id)}
        style={styles.deleteBtn}
      >
        <Icon name="delete" size={moderateScale(24)} color="red" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📝 My Tasks</Text>
      <TextInput
        style={styles.input}
        value={task}
        onChangeText={setTask}
        placeholder="Enter a new task"
      />
      <TouchableOpacity onPress={addTask} style={styles.addButton}>
        <Text style={styles.addButtonText}>Add Task</Text>
      </TouchableOpacity>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: moderateScale(20) }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: moderateScale(16),
    paddingHorizontal: moderateScale(16),
    backgroundColor: 'white',
  },
  header: {
    fontSize: fontSize(24),
    fontWeight: 'bold',
    marginBottom: moderateScale(16),
    alignSelf: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: moderateScale(8),
    padding: moderateScale(12),
    fontSize: fontSize(16),
    marginBottom: moderateScale(10),
  },
  addButton: {
    backgroundColor: 'black',
    paddingVertical: moderateScale(12),
    borderRadius: moderateScale(8),
    marginBottom: moderateScale(20),
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: fontSize(16),
    textAlign: 'center',
  },
  taskItem: {
    padding: moderateScale(12),
    borderRadius: moderateScale(10),
    marginBottom: moderateScale(10),
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskText: {
    fontSize: fontSize(16),
    fontWeight: '600',
  },
  statusText: {
    fontSize: fontSize(14),
    color: '#666',
    marginTop: moderateScale(4),
  },
  toggleBtn: {
    paddingVertical: moderateScale(6),
    paddingHorizontal: moderateScale(10),
    borderRadius: moderateScale(6),
    marginLeft: moderateScale(10),
  },
  toggleText: {
    color: 'white',
    fontSize: fontSize(12),
  },
  deleteBtn: {
    marginLeft: moderateScale(10),
  },
});

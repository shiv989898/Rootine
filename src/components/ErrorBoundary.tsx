import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, ScrollView, Button } from 'react-native';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error);
    console.error('Error info:', errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <ScrollView style={styles.scrollView}>
            <Text style={styles.title}>Something went wrong 😞</Text>
            <Text style={styles.subtitle}>
              The app crashed. Here's what happened:
            </Text>
            
            <View style={styles.errorBox}>
              <Text style={styles.errorTitle}>Error:</Text>
              <Text style={styles.errorText}>
                {this.state.error?.toString()}
              </Text>
            </View>

            {this.state.errorInfo && (
              <View style={styles.errorBox}>
                <Text style={styles.errorTitle}>Stack Trace:</Text>
                <Text style={styles.errorText}>
                  {this.state.errorInfo.componentStack}
                </Text>
              </View>
            )}

            <Button title="Try Again" onPress={this.handleReset} />
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 50,
  },
  scrollView: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
  },
  errorBox: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#721c24',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#721c24',
    fontFamily: 'monospace',
  },
});

export default ErrorBoundary;

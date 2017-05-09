# Final Project

<h2>Abstract</h2>
Despite the burgeoning success of Deep Convolutional Neural Networks (CNNs) and their pervasion into myriad domains, ranging from art and music to science and medicine, their deep and complex architectures, innumerable parameters, and nonlinear activations renders their inner workings nearly incomprehensible. This 'black box' nature of CNNs prohibits not only a robust intellectual understanding for academic endeavors and optimization engineering, but it also restricts these models and their exceptional pattern-recognition power to expert-users. Importantly, the lack of understanding how and why a CNN makes any particular decision also leads to significant legal liability for self-driving automobile companies and medical institutions. Interactive visualizations of CNNs may provide both expert and non-expert users the insight and intuition required to more optimally architect CNNs, as well as foster more confidence in their inner workings or reveal pitfalls to which solutions may be engineered. Based upon a review of current deep neural network visualization techniques, we have developed an interactive visualization of deep CNNs that enables users to interactively construct CNNs of various architectures and adjust the hyper-parameters of the CNN's layers. These models are trained on the MNIST dataset, and intermediate layer feature visualizations are provided, in addition to time-series training data, confusion matrices, and prediction probabilities.


<h2>The Team:</h2>
We had several brainstorming and working sessions. In general, we were all involved in the project extended to the following:

* **Michael Iuzzolino**: CNN developement

* **Shirly Montero Quesada**: Readme, editing final report

* **Athithyaa Panchapakesan Rajeswari**: Database/Server/Designs on Server, interface design, visual design and styling

* **Santhanakrishnan Ramani**: Database/Server/Designs on Server, interface design, visual design and styling


<h2>How to run the project?:</h2>
The project is available on AWS via the link:
http://ec2-52-26-45-54.us-west-2.compute.amazonaws.com/

In order to keep it simple we have 6 predefined Models to show the working of the tool. The parameters of the 6 Models are as follows,

* **Convolution Layer** No. of filters: 8, Spatial Extent: 3x3, Stride: 1 <br/>
  **Max Pooling Layer** Spatial Extent: 2x2, Stride: 1<br/>
  **NN Layer Ordering** Convolution, RELU, Max Pooling
* **Convolution Layer** No. of filters: 8, Spatial Extent: 5x5, Stride: 1 <br/>
  **Max Pooling Layer** Spatial Extent: 2x2, Stride: 1<br/>
  **NN Layer Ordering** Convolution, RELU, Max Pooling
* **Convolution Layer** No. of filters: 8, Spatial Extent: 3x3, Stride: 1 <br/>
  **Max Pooling Layer** Spatial Extent: 2x2, Stride: 1<br/>
  **NN Layer Ordering** Convolution, RELU, Convolution, RELU, Max Pooling
* **Convolution Layer** No. of filters: 8, Spatial Extent: 5x5, Stride: 1 <br/>
  **Max Pooling Layer** Spatial Extent: 2x2, Stride: 1<br/>
  **NN Layer Ordering** Convolution, RELU, Convolution, RELU, Max Pooling
* **Convolution Layer** No. of filters: 8, Spatial Extent: 3x3, Stride: 1 <br/>
  **Max Pooling Layer** Spatial Extent: 2x2, Stride: 1<br/>
  **NN Layer Ordering** Convolution, RELU, Max Pooling, Convolution, RELU, Max Pooling
* **Convolution Layer** No. of filters: 8, Spatial Extent: 5x5, Stride: 1 <br/>
  **Max Pooling Layer** Spatial Extent: 2x2, Stride: 1<br/>
  **NN Layer Ordering** Convolution, RELU, Max Pooling, Convolution, RELU, Max Pooling
  
**Note:** If any other parameters are chosen, while clicking predict button you will get an alert saying invalid model.
And similarly you won't be able to add more than 6 layers in the NN architecture.

The Line chart and confusion matrix remains constant for any of the specific model. 
The predict button can be clicked any number of times using a particular model and the bar chart changes
dynamically based on the input that's randomly chosen.


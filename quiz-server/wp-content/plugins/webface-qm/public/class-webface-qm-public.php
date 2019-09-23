<?php

/**
 * The public-facing functionality of the plugin.
 *
 * @link       https://www.webfacemedia.com
 * @since      1.0.0
 *
 * @package    Webface_Qm
 * @subpackage Webface_Qm/public
 */

/**
 * The public-facing functionality of the plugin.
 *
 * Defines the plugin name, version, and two examples hooks for how to
 * enqueue the public-facing stylesheet and JavaScript.
 *
 * @package    Webface_Qm
 * @subpackage Webface_Qm/public
 * @author     Tommy Adeniyi <tommyadeniyi@gmail.com>
 */
class Webface_Qm_Public {

	/**
	 * The ID of this plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $plugin_name    The ID of this plugin.
	 */
	private $plugin_name;

	/**
	 * The version of this plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $version    The current version of this plugin.
	 */
	private $version;

	/**
	 * Initialize the class and set its properties.
	 *
	 * @since    1.0.0
	 * @param      string    $plugin_name       The name of the plugin.
	 * @param      string    $version    The version of this plugin.
	 */
	public function __construct( $plugin_name, $version ) {

		$this->plugin_name = $plugin_name;
		$this->version = $version;

	}

	/**
	 * Register the stylesheets for the public-facing side of the site.
	 *
	 * @since    1.0.0
	 */
	public function enqueue_styles() {

		/**
		 * This function is provided for demonstration purposes only.
		 *
		 * An instance of this class should be passed to the run() function
		 * defined in Webface_Qm_Loader as all of the hooks are defined
		 * in that particular class.
		 *
		 * The Webface_Qm_Loader will then create the relationship
		 * between the defined hooks and the functions defined in this
		 * class.
		 */

		wp_enqueue_style( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'css/webface-qm-public.css', array(), $this->version, 'all' );

	}

	/**
	 * Register the JavaScript for the public-facing side of the site.
	 *
	 * @since    1.0.0
	 */
	public function enqueue_scripts() {

		/**
		 * This function is provided for demonstration purposes only.
		 *
		 * An instance of this class should be passed to the run() function
		 * defined in Webface_Qm_Loader as all of the hooks are defined
		 * in that particular class.
		 *
		 * The Webface_Qm_Loader will then create the relationship
		 * between the defined hooks and the functions defined in this
		 * class.
		 */

		wp_enqueue_script( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'js/webface-qm-public.js', array( 'jquery' ), $this->version, false );

	}

	public function quiz_json_output($data) {
		if ( isset( $data['acf']['questions'] ) ) {
			$data['acf']['questions'] = $this->mutate_questions($data['acf']['questions']);
		}
	
		return $data;
	}
	public function mutate_questions($questions) {
		$t_questions = array();
		$count = 1;
		foreach ($questions as $question) {
			switch ($question['question_type']) {
				case 'multiple_choice':
					$q = (object)[];
					$q->id = $count;
					$q->question = $question['question'];
					$q->question_type =  $question['question_type'];
					$options = array();
					foreach ($question['option'] as $value) {
						array_push($options,['option'=> $value['single-option']]);
					}
					array_push($options,['option'=>$question['correct-option']]);
					shuffle($options);
					$q->options = $options;
					$q->has_image = $question['has_image'];
					$q->image = $question['image'];
					array_push($t_questions,$q);
					break;
				case 'multiple_answers':
					$q = (object)[];
					$q->id = $count;
					$q->question = $question['question'];
					$q->question_type =  $question['question_type'];
					$options = array();
					foreach ($question['correct_choices'] as $value) {
						array_push($options,['option'=> $value['correct-choice']]);
					}
					foreach ($question['incorrect_choices'] as $value) {
						array_push($options,['option'=> $value['incorrect-choice']]);
					}
					shuffle($options);
					$q->options = $options;
					$q->has_image = $question['has_image'];
					$q->image = $question['image'];
					array_push($t_questions,$q);
					break;
				case 'true_false':
					$q = (object)[];
					$q->id = $count;
					$q->question = $question['question'];
					$q->question_type =  $question['question_type'];
					$options = array();
					array_push($options,['option'=>$question['true-statement']]);
					array_push($options,['option'=>$question['false-statement']]);
					shuffle($options);
					$q->options = $options;
					$q->has_image = $question['has_image'];
					$q->image = $question['image'];
					array_push($t_questions,$q);
					break;
				case 'fill_in':
					$q = (object)[];
					$q->id = $count;
					$q->question = $question['question'];
					$q->question_type =  $question['question_type'];
					$q->answer_type = $question['answer_type'];
					$q->question_text = $question['question-text'];
					$q->has_image = $question['has_image'];
					$q->image = $question['image'];
					array_push($t_questions,$q);
					break;
				default:
					# code...
					break;
			}
			$count++;
		}	
		return $t_questions;
	}

}
